/**
 * @file
 * Javascript implementations for HTA Establishment widget.
 */
(function ($) {
  "use strict";


  Drupal.behaviors.htaEstablishmentWidget = {

    /**
     * Drupal.behaviors :attach method. Called from Drupal.attachBehaviors().
     *
     * @param context
     *   Context of this attachBehaviors().
     * @param settings
     *   Settings passed from attachBehaviors().
     */
    attach: function (context, settings) {

      $('.hta-establishment-widget-embed .embed-copy', context).click(function() {
        var embed_input = $(this).closest('.hta-establishment-widget-embed').find('.embed-code');
        copyToClipboard(embed_input);
      });

      function copyToClipboard(element) {
        var temp = $('<input>');

        $('body').append(temp);
        temp.val(element.val()).select();
        document.execCommand('copy');
        temp.remove();
      }
    }
  }
})(jQuery);
