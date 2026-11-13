/* Pannello MoveOn: scelta di immagini dalla Libreria media (logo, immagine del carosello, immagini dei progetti). */
jQuery(function ($) {
  // Colori (sfondi delle pagine dei progetti)
  if ($.fn.wpColorPicker) $('.mo-colore').wpColorPicker();
  // Immagine singola (logo, immagine del carosello, immagini di sfondo)
  $(document).on('click', '.mo-scegli-immagine', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    var frame = wp.media({ title: 'Scegli un’immagine', button: { text: 'Usa questa immagine' }, library: { type: 'image' }, multiple: false });
    frame.on('select', function () {
      var a = frame.state().get('selection').first().toJSON();
      $('#' + target).val(a.id);
      var url = (a.sizes && a.sizes.medium) ? a.sizes.medium.url : a.url;
      $('#' + target + '-anteprima').html('<img src="' + url + '" alt="">');
      $('.mo-scegli-immagine[data-target="' + target + '"]').text('Sostituisci');
    });
    frame.open();
  });
  // Video di sfondo (sfondi delle pagine dei progetti): si salva l'indirizzo del file
  $(document).on('click', '.mo-scegli-video', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    var frame = wp.media({ title: 'Scegli un video', button: { text: 'Usa questo video' }, library: { type: 'video' }, multiple: false });
    frame.on('select', function () { $('#' + target).val(frame.state().get('selection').first().toJSON().url); });
    frame.open();
  });
  $(document).on('click', '.mo-togli-video', function (e) {
    e.preventDefault();
    $('#' + $(this).data('target')).val('');
  });
  $(document).on('click', '.mo-togli-immagine', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    $('#' + target).val('');
    $('#' + target + '-anteprima').empty();
    $('.mo-scegli-immagine[data-target="' + target + '"]').filter(function () { return $(this).text() === 'Sostituisci'; }).text('Scegli l’immagine');
  });
  // Immagini del progetto: aggiungi, sostituisci, togli, trascina per l'ordine
  function voce(a) {
    var u = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
    return $('<li class="mo-galleria-voce">').attr('data-id', a.id)
      .append($('<img alt="">').attr('src', u))
      .append('<button type="button" class="mo-galleria-sostituisci">Sostituisci</button>')
      .append('<button type="button" class="mo-galleria-togli" aria-label="Togli questa immagine">×</button>');
  }
  function sincronizza($ul) {
    var ids = $ul.children('li').map(function () { return $(this).attr('data-id'); }).get();
    $('#' + $ul.data('target')).val(ids.join(','));
  }
  function ordinabile() {
    if ($.fn.sortable) $('.mo-galleria').sortable({ items: '> li', cursor: 'grabbing', update: function () { sincronizza($(this)); } });
  }
  ordinabile();
  $(document).on('click', '.mo-aggiungi-galleria', function (e) {
    e.preventDefault();
    var $ul = $('.mo-galleria[data-target="' + $(this).data('target') + '"]');
    var frame = wp.media({ title: 'Aggiungi immagini al progetto', button: { text: 'Aggiungi' }, library: { type: 'image' }, multiple: 'add' });
    frame.on('select', function () {
      frame.state().get('selection').toJSON().forEach(function (a) {
        if (!$ul.children('li[data-id="' + a.id + '"]').length) $ul.append(voce(a));
      });
      sincronizza($ul);
      ordinabile();
    });
    frame.open();
  });
  $(document).on('click', '.mo-galleria-sostituisci', function (e) {
    e.preventDefault();
    var $li = $(this).closest('li'), $ul = $li.parent();
    var frame = wp.media({ title: 'Sostituisci l’immagine', button: { text: 'Usa questa immagine' }, library: { type: 'image' }, multiple: false });
    frame.on('select', function () {
      $li.replaceWith(voce(frame.state().get('selection').first().toJSON()));
      sincronizza($ul);
    });
    frame.open();
  });
  $(document).on('click', '.mo-galleria-togli', function (e) {
    e.preventDefault();
    var $ul = $(this).closest('ul');
    $(this).closest('li').remove();
    sincronizza($ul);
  });
  $(document).on('click', '.mo-svuota-galleria', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    $('#' + target).val('');
    $('.mo-galleria[data-target="' + target + '"], .mo-galleria-anteprima[data-target="' + target + '"]').empty();
  });
});
