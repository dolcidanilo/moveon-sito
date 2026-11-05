<?php
/**
 * Motore dei modelli HTML.
 *
 * I modelli sono file HTML normali con pochi segnaposto (sintassi "Mustache"):
 *   {{nome}}              testo (sicuro: i caratteri speciali vengono convertiti)
 *   {{{nome}}}            HTML così com'è (usato per illustrazioni e icone)
 *   {{#elenco}}…{{/elenco}}  ripete il pezzo per ogni voce; se è un sì/no, lo mostra solo se "sì"
 *   {{^nome}}…{{/nome}}   mostra il pezzo solo se "nome" è vuoto o assente
 *   {{> nome}}            inserisce un altro modello (es. un'icona dalla cartella parti/)
 *   {{.}}                 la voce corrente di un elenco di testi
 *   {{! nota }}           commento, non compare nella pagina
 *
 * Dove vengono cercati (il primo che esiste vince):
 *   1. la versione modificata in WordPress → MoveOn → Modelli HTML (salvata nel database)
 *   2. il file nel tema figlio:  wp-content/themes/<tema-figlio>/moveon/<nome>.html
 *   3. il file originale del plugin: templates/<nome>.html (o templates/parti/<nome>.html)
 */

defined( 'ABSPATH' ) || exit;

final class MO_Tpl {

	const OPTION = 'moveon_templates';

	/** Nome valido di modello: lettere minuscole, numeri, trattini e al massimo una cartella "parti/". */
	public static function valid_name( string $name ): bool {
		return (bool) preg_match( '#^(parti/)?[a-z0-9-]+$#', $name );
	}

	/** Elenco dei modelli disponibili, raggruppati: sezioni, parti fisse, illustrazioni e icone. */
	public static function all_names(): array {
		$out = array();
		foreach ( glob( MOVEON_DIR . 'templates/*.html' ) as $f ) {
			$out[] = basename( $f, '.html' );
		}
		foreach ( glob( MOVEON_DIR . 'templates/parti/*.html' ) as $f ) {
			$out[] = 'parti/' . basename( $f, '.html' );
		}
		return $out;
	}

	/** Testo originale del plugin (per il pulsante "Ripristina"). */
	public static function original( string $name ): string {
		if ( ! self::valid_name( $name ) ) {
			return '';
		}
		foreach ( array( $name, 'parti/' . $name ) as $n ) {
			$file = MOVEON_DIR . 'templates/' . $n . '.html';
			if ( is_readable( $file ) ) {
				return (string) file_get_contents( $file );
			}
		}
		return '';
	}

	/** Nome completo: "cubo" diventa "parti/cubo" se il modello sta nella cartella delle parti. */
	public static function resolve_name( string $name ): string {
		if ( strpos( $name, 'parti/' ) === 0 || is_readable( MOVEON_DIR . 'templates/' . $name . '.html' ) ) {
			return $name;
		}
		return 'parti/' . $name;
	}

	/** Testo del modello in uso (modificato, tema figlio o originale). */
	public static function source( string $name ): string {
		$name = self::resolve_name( $name );
		if ( ! self::valid_name( $name ) ) {
			return '';
		}
		$custom = get_option( self::OPTION, array() );
		if ( is_array( $custom ) && isset( $custom[ $name ] ) && '' !== trim( (string) $custom[ $name ] ) ) {
			return (string) $custom[ $name ];
		}
		$child = trailingslashit( get_stylesheet_directory() ) . 'moveon/' . $name . '.html';
		if ( is_readable( $child ) ) {
			return (string) file_get_contents( $child );
		}
		return self::original( $name );
	}

	/** Da dove viene il modello in uso: 'pannello', 'tema' o 'plugin'. */
	public static function origin( string $name ): string {
		$name   = self::resolve_name( $name );
		$custom = get_option( self::OPTION, array() );
		if ( is_array( $custom ) && ! empty( $custom[ $name ] ) ) {
			return 'pannello';
		}
		return is_readable( trailingslashit( get_stylesheet_directory() ) . 'moveon/' . $name . '.html' ) ? 'tema' : 'plugin';
	}

	public static function render( string $name, array $data = array() ): string {
		return self::render_string( self::source( $name ), array( $data ), 0 );
	}

	/* ------------------------------------------------------------------ */

	private static function render_string( string $tpl, array $stack, int $depth ): string {
		if ( $depth > 12 ) {
			return '';
		}
		$tree = self::parse( $tpl );
		return self::render_nodes( $tree, $stack, $depth );
	}

	/** Trasforma il testo del modello in un albero di pezzi (testo, segnaposto, sezioni, inclusioni). */
	private static function parse( string $tpl ): array {
		static $cache = array();
		$key = md5( $tpl );
		if ( isset( $cache[ $key ] ) ) {
			return $cache[ $key ];
		}
		$re     = '/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{(!)(.*?)\}\}|\{\{\s*([#^\/>]?)\s*([\w.\/-]+|\.)\s*\}\}/s';
		$root   = array();
		$stack  = array( array( 'children' => &$root ) );
		$offset = 0;
		while ( preg_match( $re, $tpl, $m, PREG_OFFSET_CAPTURE, $offset ) ) {
			$pos = $m[0][1];
			if ( $pos > $offset ) {
				$top                 = &$stack[ count( $stack ) - 1 ];
				$top['children'][]   = array( 't' => 'text', 'v' => substr( $tpl, $offset, $pos - $offset ) );
				unset( $top );
			}
			$offset = $pos + strlen( $m[0][0] );
			$top    = &$stack[ count( $stack ) - 1 ];
			if ( isset( $m[1] ) && '' !== $m[1][0] && $m[1][1] >= 0 ) {
				$top['children'][] = array( 't' => 'raw', 'v' => $m[1][0] );
			} elseif ( isset( $m[2] ) && '!' === $m[2][0] ) {
				// commento: niente
			} else {
				$sigil = $m[4][0];
				$name  = $m[5][0];
				if ( '#' === $sigil || '^' === $sigil ) {
					$node              = array( 't' => 'section', 'v' => $name, 'inv' => '^' === $sigil, 'children' => array() );
					$top['children'][] = $node;
					$idx               = count( $top['children'] ) - 1;
					$stack[]           = array( 'children' => &$top['children'][ $idx ]['children'], 'name' => $name );
				} elseif ( '/' === $sigil ) {
					if ( count( $stack ) > 1 ) {
						array_pop( $stack );
					}
				} elseif ( '>' === $sigil ) {
					$top['children'][] = array( 't' => 'partial', 'v' => $name );
				} else {
					$top['children'][] = array( 't' => 'var', 'v' => $name );
				}
			}
			unset( $top );
		}
		if ( $offset < strlen( $tpl ) ) {
			$root[] = array( 't' => 'text', 'v' => substr( $tpl, $offset ) );
		}
		$cache[ $key ] = $root;
		return $root;
	}

	private static function lookup( string $name, array $stack ) {
		if ( '.' === $name ) {
			return end( $stack );
		}
		$parts = explode( '.', $name );
		$first = array_shift( $parts );
		for ( $i = count( $stack ) - 1; $i >= 0; $i-- ) {
			$ctx = $stack[ $i ];
			if ( is_array( $ctx ) && array_key_exists( $first, $ctx ) ) {
				$val = $ctx[ $first ];
				foreach ( $parts as $p ) {
					$val = ( is_array( $val ) && array_key_exists( $p, $val ) ) ? $val[ $p ] : null;
				}
				return $val;
			}
		}
		return null;
	}

	private static function is_empty( $v ): bool {
		return null === $v || false === $v || '' === $v || ( is_array( $v ) && ! $v );
	}

	private static function render_nodes( array $nodes, array $stack, int $depth ): string {
		$out = '';
		foreach ( $nodes as $n ) {
			switch ( $n['t'] ) {
				case 'text':
					$out .= $n['v'];
					break;
				case 'var':
					$v    = self::lookup( $n['v'], $stack );
					$out .= is_scalar( $v ) ? esc_html( (string) $v ) : '';
					break;
				case 'raw':
					$v    = self::lookup( $n['v'], $stack );
					$out .= is_scalar( $v ) ? (string) $v : '';
					break;
				case 'partial':
					$out .= self::render_string( self::source( $n['v'] ), $stack, $depth + 1 );
					break;
				case 'section':
					$v = self::lookup( $n['v'], $stack );
					if ( $n['inv'] ) {
						if ( self::is_empty( $v ) ) {
							$out .= self::render_nodes( $n['children'], $stack, $depth );
						}
						break;
					}
					if ( self::is_empty( $v ) ) {
						break;
					}
					if ( is_array( $v ) && array_is_list( $v ) ) {
						foreach ( $v as $item ) {
							$out .= self::render_nodes( $n['children'], array_merge( $stack, array( $item ) ), $depth );
						}
					} elseif ( is_array( $v ) ) {
						$out .= self::render_nodes( $n['children'], array_merge( $stack, array( $v ) ), $depth );
					} else {
						$out .= self::render_nodes( $n['children'], $stack, $depth );
					}
					break;
			}
		}
		return $out;
	}
}
