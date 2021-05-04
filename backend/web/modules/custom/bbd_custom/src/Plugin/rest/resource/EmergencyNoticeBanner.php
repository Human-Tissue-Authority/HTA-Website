<?php
namespace Drupal\bbd_custom\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ModifiedResourceResponse;

/**
 * Emergency Notice Banner
 *
 * @RestResource(
 *   id = "emergency_notice_banner",
 *   label = @Translation("Emergency Notice Banner"),
 *   uri_paths = {
 *     "canonical" = "/bbd_custom_rest_api/emergency-notice-banner"
 *   }
 * )
 */
class EmergencyNoticeBanner extends ResourceBase {
  /**
   * Responds to entity GET requests.
   * @return \Drupal\rest\ResourceResponse
   */
  public function get() {
    $config = \Drupal::config('bigbluedoor_emergency_message.settings');

    $message = [];
    $message['popup_enabled'] = !empty($config->get('popup_enabled')) ? $config->get('popup_enabled') : FALSE;
    $message['notice_title'] = !empty($config->get('notice_title')) ? $config->get('notice_title') : '';
    $message['notice_text'] = !empty($config->get('notice_text')) ? $config->get('notice_text') : ['value' => '', 'format' => 'full_html'];
    $message['open_button_text'] = !empty($config->get('open_button_text')) ? $config->get('open_button_text') : $this->t('Display alert');
    $message['path_exclusions'] = $config->get('path_exclusions') ? $config->get('path_exclusions') : '';
    $message['submission_id'] = $config->get('form_submission_uuid') ? $config->get('form_submission_uuid') : '';

    return new ModifiedResourceResponse($message);
  }
}

