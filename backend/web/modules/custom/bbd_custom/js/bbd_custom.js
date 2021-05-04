(function ($, Drupal, drupalSettings) {
  "use strict";

  /**
   * Main behavior NWADCS module.
   */

  Drupal.behaviors.ToggleEventInfo = {
    /**
     * Attach method for this behavior.
     *
     * @param context
     *   The context for which the behavior is being executed. This is either
     *   the full page or a piece of HTML that was just added through Ajax.
     * @param settings
     *   An array of settings (added through drupal_add_js()). Instead of
     *   accessing Drupal.settings directly you should use this because of
     *   potential modifications made by the Ajax callback that also produced
     *   'context'.
     */
    attach: function (context, settings) {
      $("input[name='field_news_type'", context).change(function(){
        if ($(this).val() == 'News') {
          $("#edit-group-event-information", context).hide();
        }
        else {
          $("#edit-group-event-information", context).show();
        }
      });

      if ($('input[name="field_news_type"]:checked', context).val() == 'News') {
        $("#edit-group-event-information", context).hide();
      }
    }
  };

})(jQuery, Drupal, drupalSettings);
