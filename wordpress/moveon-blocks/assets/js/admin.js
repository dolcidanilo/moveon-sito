/* Pannello MoveOn: scelta di immagini dalla Libreria media (logo, galleria dei progetti). */
jQuery(function ($) {
  // Immagine singola (logo)
  $(document).on('click', '.mo-scegli-immagine', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    var frame = wp.media({ title: 'Scegli un’immagine', button: { text: 'Usa questa immagine' }, library: { type: 'image' }, multiple: false });
    frame.on('select', function () {
      var a = frame.state().get('selection').first().toJSON();
      $('#' + target).val(a.id);
      var url = (a.sizes && a.sizes.medium) ? a.sizes.medium.url : a.url;
      $('#' + target + '-anteprima').html('<img src="' + url + '" alt="">');
    });
    frame.open();
  });
  $(document).on('click', '.mo-togli-immagine', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    $('#' + target).val('');
    $('#' + target + '-anteprima').empty();
  });
  // Galleria (progetti)
  $(document).on('click', '.mo-scegli-galleria', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    var frame = wp.media({ title: 'Galleria del progetto', button: { text: 'Usa queste immagini' }, library: { type: 'image' }, multiple: 'add' });
    frame.on('open', function () {
      var sel = frame.state().get('selection');
      String($('#' + target).val() || '').split(',').filter(Boolean).forEach(function (id) {
        var att = wp.media.attachment(id); att.fetch(); sel.add(att);
      });
    });
    frame.on('select', function () {
      var items = frame.state().get('selection').toJSON();
      $('#' + target).val(items.map(function (a) { return a.id; }).join(','));
      $('.mo-galleria-anteprima[data-target="' + target + '"]').html(items.map(function (a) {
        var u = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
        return '<img src="' + u + '" alt="">';
      }).join(''));
    });
    frame.open();
  });
  $(document).on('click', '.mo-svuota-galleria', function (e) {
    e.preventDefault();
    var target = $(this).data('target');
    $('#' + target).val('');
    $('.mo-galleria-anteprima[data-target="' + target + '"]').empty();
  });
});
