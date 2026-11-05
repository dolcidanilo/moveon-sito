#!/usr/bin/env bash
# Crea un WordPress di prova (6.5, database SQLite) in una sottocartella /nuovo, come su Aruba,
# con il plugin MoveOn Blocks collegato, la pagina demo e la pagina "prova-classi" per i controlli.
# Non serve MySQL né accesso a wordpress.org: WordPress arriva da un pacchetto npm.
#
# Uso:  bash tools/wp-prova.sh [cartella]          (di serie /tmp/moveon-wp)
# Poi:  sito su http://127.0.0.1:8080/nuovo/  ·  pannello: admin / prova-moveon-1
#       node tests/check.mjs  ·  php tests/plugin-check.php <cartella>/wp
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:-/tmp/moveon-wp}"
PORT=8080
mkdir -p "$DIR"
cd "$DIR"

if [ ! -f wp/wp-load.php ]; then
  echo "· Scarico WordPress dal pacchetto npm @wp-playground/wordpress-builds…"
  npm pack @wp-playground/wordpress-builds@0.9.19 >/dev/null
  TGZ=wp-playground-wordpress-builds-0.9.19.tgz
  tar xzf "$TGZ" package/src/wordpress/wp-6.5.zip package/src/sqlite-database-integration/sqlite-database-integration.zip package/public/wp-6.5
  mkdir -p wp && (cd wp && unzip -q ../package/src/wordpress/wp-6.5.zip)
  cp -r --update=none package/public/wp-6.5/. wp/           # file statici (CodeMirror, stili del pannello…)
  rm -f wp/wp-content/database/.ht.sqlite                   # il pacchetto ha un database di un altro indirizzo
  (cd wp/wp-content/plugins && unzip -q -o ../../../package/src/sqlite-database-integration/sqlite-database-integration.zip)
  SQ="$DIR/wp/wp-content/plugins/sqlite-database-integration-main"
  sed -e "s#{SQLITE_IMPLEMENTATION_FOLDER_PATH}#$SQ#" -e "s#{SQLITE_PLUGIN}#sqlite-database-integration-main/load.php#" "$SQ/db.copy" > wp/wp-content/db.php
  python3 - "$DIR/wp/wp-config.php" <<'PY'
import re, secrets, sys
p = sys.argv[1]; s = open(p).read()
s = re.sub(r"put your unique phrase here", lambda m: secrets.token_hex(24), s)
s = s.replace("define( 'WP_DEBUG', false );", "define( 'WP_DEBUG', true );\ndefine( 'WP_DEBUG_LOG', true );\ndefine( 'WP_DEBUG_DISPLAY', false );\ndefine( 'DB_DIR', __DIR__ . '/wp-content/database/' );\ndefine( 'DB_FILE', '.ht.sqlite' );\ndefine( 'FS_METHOD', 'direct' );\ndefine( 'AUTOMATIC_UPDATER_DISABLED', true );\ndefine( 'WP_HTTP_BLOCK_EXTERNAL', true );")
open(p, 'w').write(s)
PY
  rm -rf package "$TGZ"
fi

# Sottocartella /nuovo e router per il server PHP integrato
mkdir -p site && ln -sfn "$DIR/wp" site/nuovo
cat > router.php <<'PHP'
<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)); $root = $_SERVER['DOCUMENT_ROOT'];
if ($uri !== '/' && file_exists($root . $uri) && !is_dir($root . $uri)) return false;
if (is_dir($root . $uri) && file_exists(rtrim($root . $uri, '/') . '/index.php')) { $_SERVER['SCRIPT_NAME'] = rtrim($uri, '/') . '/index.php'; require rtrim($root . $uri, '/') . '/index.php'; return; }
if (strpos($uri, '/nuovo') === 0) { $_SERVER['SCRIPT_NAME'] = '/nuovo/index.php'; require $root . '/nuovo/index.php'; return; }
http_response_code(404);
PHP
if ! curl -s -o /dev/null "http://127.0.0.1:$PORT/nuovo/wp-login.php"; then
  nohup php -S 127.0.0.1:$PORT -t "$DIR/site" "$DIR/router.php" > "$DIR/php.log" 2>&1 < /dev/null &
  disown
  sleep 1
fi

# Installazione (solo la prima volta)
if [ ! -f wp/wp-content/database/.ht.sqlite ]; then
  curl -s -o /dev/null -d "weblog_title=MoveOn Studio&user_name=admin&admin_password=prova-moveon-1&admin_password2=prova-moveon-1&pw_weak=1&admin_email=admin@example.com&blog_public=0" "http://127.0.0.1:$PORT/nuovo/wp-admin/install.php?step=2"
fi

# Plugin collegato alla cartella del repository (le modifiche si vedono subito)
ln -sfn "$REPO/wordpress/moveon-blocks" wp/wp-content/plugins/moveon-blocks
mkdir -p wp/wp-content/mu-plugins
printf '%s\n' '<?php' "add_filter( 'moveon_limite_richieste_ora', function () { return 1000; } ); // prove automatiche" > wp/wp-content/mu-plugins/prova-limiti.php
cp "$REPO/tests/tema-ostile.php" wp/wp-content/mu-plugins/tema-ostile.php   # simula le regole di Porto che interferivano

cat > wpcli.php <<'PHP'
<?php
$_SERVER['HTTP_HOST'] = '127.0.0.1:8080'; $_SERVER['REQUEST_URI'] = '/nuovo/';
define('WP_USE_THEMES', false);
require __DIR__ . '/wp/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
eval($argv[1]);
PHP
php wpcli.php '
update_option("permalink_structure", "/%postname%/");
if ( ! is_plugin_active("moveon-blocks/moveon-blocks.php") ) { activate_plugin("moveon-blocks/moveon-blocks.php"); }
flush_rewrite_rules();
' 2>/dev/null
php wpcli.php '
if ( ! get_option("page_on_front") ) { $e = mo_crea_demo(true); echo "· Pagina demo creata\n"; }
if ( ! get_page_by_path("prova-classi") ) {
  $c = "[mo_hero]\n<div class=\"mo-section mo-section--alt\" style=\"min-height:60vh\"><h2 class=\"mo-overline mo-reveal\">Recensioni</h2><p class=\"mo-h1 mo-reveal mo-delay-2\">Cosa dicono di noi</p><div class=\"mo-stagger\"><div class=\"mo-card mo-card--pad mo-tilt\">Uno</div><div class=\"mo-card mo-card--pad\">Due</div><div class=\"mo-card mo-card--pad\">Tre</div></div><p class=\"mo-lead mo-words\">Testo con <strong>grassetto</strong> e un <a href=\"#top\">link</a> che si accende parola per parola.</p><div class=\"mo-parallax\" style=\"height:80px;background:var(--mo-brand)\"></div><a class=\"mo-btn mo-btn--primary mo-magnetic\" href=\"#top\">Pulsante</a></div><div style=\"height:120vh\"></div>";
  $id = wp_insert_post(["post_type"=>"page","post_status"=>"publish","post_title"=>"Prova classi","post_name"=>"prova-classi","post_content"=>$c]);
  update_post_meta($id, "_wp_page_template", "moveon-pagina-intera");
  echo "· Pagina prova-classi creata\n";
}
' 2>/dev/null
php wpcli.php '
$vecchia = get_page_by_path("prova-sfondo"); if ( $vecchia && false === strpos( $vecchia->post_content, "colore_titoli" ) ) { wp_delete_post( $vecchia->ID, true ); $vecchia = null; }
if ( ! $vecchia ) {
  $img = mo_importa_immagine("pausa-cuffie.jpg", "Foto di prova per lo sfondo");
  $c = "[mo_garanzie sfondo_img=\"$img\" sfondo_opacita=\"40\"]\n[mo_contatti sfondo_img=\"$img\" sfondo_dimensione=\"contain\" sfondo_posizione=\"50% 0%\"]\n[mo_portfolio sfondo_colore=\"#2563eb\" sfondo_testi=\"chiari\" anchor=\"pf2\"]\n[mo_garanzie sfondo_colore=\"#0f172a\" sfondo_testi=\"chiari\" anchor=\"gar2\"]\n[mo_portfolio anchor=\"pf3\" sfondo_colore=\"#f59e0b\" sfondo_testi=\"scuri\" colore_titoli=\"#7c2d12\" colore_testi=\"#431407\" colore_etichette=\"#1d4ed8\"]";
  $id = wp_insert_post(["post_type"=>"page","post_status"=>"publish","post_title"=>"Prova sfondo","post_name"=>"prova-sfondo","post_content"=>$c]);
  update_post_meta($id, "_wp_page_template", "moveon-pagina-intera");
  echo "· Pagina prova-sfondo creata\n";
}
' 2>/dev/null
echo "Pronto: http://127.0.0.1:$PORT/nuovo/  (pannello: admin / prova-moveon-1)"
