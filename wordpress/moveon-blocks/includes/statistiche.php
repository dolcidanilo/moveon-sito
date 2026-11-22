<?php
/**
 * Google Analytics 4 solo dopo il consenso (1.11.0).
 * Il codice di Google (gtag.js) NON si carica finché il banner dei cookie (iubenda oggi, LegalBlink domani: qualsiasi
 * banner con Google Consent Mode v2) non comunica il consenso alle statistiche (analytics_storage = granted).
 * Prima del consenso non parte nessuna richiesta verso Google. Le visite di chi è collegato al pannello non si contano.
 */

defined( 'ABSPATH' ) || exit;

/** ID di misurazione valido (G-XXXXXXX) o stringa vuota. */
function mo_analytics_id( $v = null ): string {
	$id = strtoupper( trim( (string) ( null === $v ? ( mo_settings()['analytics_id'] ?? '' ) : $v ) ) );
	return preg_match( '/^G-[A-Z0-9]{4,20}$/', $id ) ? $id : '';
}

/** Codice da mettere nel <head>, prima del banner dei cookie. */
function mo_analytics_codice( string $id ): string {
	$js = <<<'JS'
(function(id){
  var w=window,dl=w.dataLayer=w.dataLayer||[],caricato=false,dato=false;
  function gtag(){dl.push(arguments);}
  if(!w.gtag)w.gtag=gtag;
  function concesso(a){return a&&a[0]==='consent'&&a[1]==='update'&&a[2]&&a[2].analytics_storage==='granted';}
  for(var i=0;i<dl.length;i++){if(concesso(dl[i]))dato=true;}
  if(!dato)w.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
  w.gtag('js',new Date());
  w.gtag('config',id);
  function carica(){if(caricato)return;caricato=true;var s=document.createElement('script');s.async=true;s.className='mo-gtag';s.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.appendChild(s);}
  if(dato)carica();
  var push=dl.push;
  dl.push=function(){for(var i=0;i<arguments.length;i++){if(concesso(arguments[i]))carica();}return push.apply(dl,arguments);};
})(%s);
JS;
	return '<script id="mo-analytics">' . sprintf( $js, wp_json_encode( $id ) ) . "</script>\n";
}

/** Le statistiche valgono per questa pagina? (non nel pannello, non per chi è collegato, non nell'editor di WPBakery) */
function mo_analytics_attivo(): bool {
	if ( is_admin() || is_user_logged_in() || is_preview() ) {
		return false;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['vc_editable'] ) || isset( $_GET['vc_action'] ) ) {
		return false;
	}
	if ( function_exists( 'mo_marchio_pagina' ) && mo_marchio_pagina() ) {
		return false; // le pagine dimostrative non entrano nelle statistiche
	}
	return '' !== mo_analytics_id();
}

add_action(
	'wp_head',
	function () {
		if ( mo_analytics_attivo() ) {
			echo mo_analytics_codice( mo_analytics_id() ); // phpcs:ignore WordPress.Security.EscapeOutput
		}
	},
	1
);
