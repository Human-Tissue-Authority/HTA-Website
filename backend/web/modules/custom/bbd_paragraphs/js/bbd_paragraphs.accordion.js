(function ($, Drupal, drupalSettings) {
  "use strict";

  /**
   * Behavior for accordion paragraph.
   */

  Drupal.behaviors.AccordionParagraph = {
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
      // Add expanded class to title by default.
      $('.expandable-content-section.expanded', context).find('.field--name-field-title').addClass('expanded');
      // Toggle content.
      $('.expandable-content-section .field--name-field-title', context).click(function () {
        $(this).toggleClass('expanded').parent().find('.field--name-field-description').slideToggle('slow');
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
