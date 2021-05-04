<?php

/**
 * @file
 * Contains \Drupal\jmpp_custom\Form\JMPPSettingsForm.
 */

namespace Drupal\hta_establishment_widget\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\file\Entity\File;
use Drupal\link\LinkItemInterface;
use Drupal\Core\Entity\Element\EntityAutocomplete;

/**
 * Configure settings.
 */
class HTAWidgetSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'hta_establishment_widget_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'hta_establishment_widget.admin_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('hta_establishment_widget.admin_settings');

    $form['hta_establishment_widget']['widget_image'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('Licence image'),
      '#upload_location' => 'public://licence-image/',
      '#default_value' => $config->get('widget_image') ? $config->get('widget_image') : '',
      '#upload_validators' => [
        'file_validate_extensions' => ['png jpg jpeg'],
      ],
    ];

    $css = 'html,
      body {
        padding: 0;
        margin: 0;
      }
      .hta-licenced-image {
        max-width: 300px;
        height: auto;
        width: 100%;
      }';

    $form['hta_establishment_widget']['widget_css'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Establishment Widget CSS'),
      '#default_value' => $config->get('hta_establishment_widget_css') ? $config->get('hta_establishment_widget_css') : $css,
    ];

    $form['hta_establishment_widget']['widget_js'] = [
      '#type' => 'textarea',
      '#description' => 'JQuery 3.1.0 is provided. You do not need to add $(document).ready()',
      '#title' => $this->t('Establishment Widget JavaScript'),
      '#default_value' => $config->get('widget_js') ? $config->get('widget_js') : '',
    ];

    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('hta_establishment_widget.admin_settings');
    $image_fields = $this->getFormImageFieldsKeys();
    $config->set('hta_establishment_widget_js', $form_state->getValue('widget_js'));
    $config->set('hta_establishment_widget_css', $form_state->getValue('widget_css'));

    foreach($image_fields as $image_field) {
      if ($image = $form_state->getValue($image_field)) {
        // Set file status to permanent.
        $file = File::load($image[0]);
        $file->setPermanent();
        $file->save();

        $config->set(
          $image_field,
          $image);
      }
      else {
        $config->set(
          $image_field,
          [0]);
      }
    }

    $config->save();

    drupal_flush_all_caches();
    parent::submitForm($form, $form_state);
  }

  /**
   * Gets all form images fields keys
   *
   * @return array
   */
  private function getFormImageFieldsKeys () {
    return [
      'widget_image'
    ];
  }

  /**
   * Form element validation handler for the 'uri' element.
   *
   * Disallows saving inaccessible or untrusted URLs.
   */
  public static function validateUriElement($element, FormStateInterface $form_state, $form) {
    $uri = static::getUserEnteredStringAsUri($element['#value']);
    $form_state->setValueForElement($element, $uri);

    // If getUserEnteredStringAsUri() mapped the entered value to a 'internal:'
    // URI , ensure the raw value begins with '/', '?' or '#'.
    if (parse_url($uri, PHP_URL_SCHEME) === 'internal' &&
      !in_array($element['#value'][0], ['/', '?', '#'], TRUE) &&
      substr($element['#value'], 0, 7) !== '<front>') {
      $form_state->setError($element, t('Manually entered paths should start with /, ? or #.'));
      return;
    }
  }

  /**
   * Gets the user-entered string as a URI.
   *
   * @param string $string
   *   The user-entered string.
   *
   * @return string
   *   The URI, if a non-empty $uri was passed.
   */
  protected static function getUserEnteredStringAsUri($string) {
    // By default, assume the entered string is an URI.
    $uri = trim($string);

    // Detect entity autocomplete string, map to 'entity:' URI.
    $entity_id = EntityAutocomplete::extractEntityIdFromAutocompleteInput($string);
    if ($entity_id !== NULL) {
      $uri = 'entity:node/' . $entity_id;
    }
    // Detect a schemeless string, map to 'internal:' URI.
    elseif (!empty($string) && parse_url($string, PHP_URL_SCHEME) === NULL) {

      if (strpos($string, '<front>') === 0) {
        $string = '/' . substr($string, strlen('<front>'));
      }
      $uri = 'internal:' . $string;
    }

    return $uri;
  }

  /**
   * Gets the URI without the 'internal:' or 'entity:' scheme.
   *
   * @param $uri
   *   The URI to get the displayable string for.
   *
   * @return string
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  protected static function getUriAsDisplayableString($uri) {
    $scheme = parse_url($uri, PHP_URL_SCHEME);

    // By default, the displayable string is the URI.
    $displayable_string = $uri;

    // A different displayable string may be chosen in case of the 'internal:'
    // or 'entity:' built-in schemes.
    if ($scheme === 'internal') {
      $uri_reference = explode(':', $uri, 2)[1];

      $path = parse_url($uri, PHP_URL_PATH);
      if ($path === '/') {
        $uri_reference = '<front>' . substr($uri_reference, 1);
      }
      $displayable_string = $uri_reference;
    }
    elseif ($scheme === 'entity') {
      list($entity_type, $entity_id) = explode('/', substr($uri, 7), 2);

      // Show the 'entity:' URI as the entity autocomplete would.
      if ($entity_type == 'node' &&
        $entity = \Drupal::entityTypeManager()
          ->getStorage($entity_type)
          ->load($entity_id)) {
        $displayable_string = EntityAutocomplete::getEntityLabels([$entity]);
      }
    }

    return $displayable_string;
  }

}
