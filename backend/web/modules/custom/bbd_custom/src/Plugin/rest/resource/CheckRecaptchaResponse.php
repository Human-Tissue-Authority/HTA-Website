<?php
namespace Drupal\bbd_custom\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ModifiedResourceResponse;

/**
 * Check Recaptcha Response
 *
 * @RestResource(
 *   id = "check_recaptcha_response",
 *   label = @Translation("Checks Recaptcha Response"),
 *   uri_paths = {
 *     "create" = "/bbd_custom_rest_api/check-recaptcha-response"
 *   }
 * )
 */
class CheckRecaptchaResponse extends ResourceBase {
  /**
   * Responds to entity POST requests and saves the new entity.
   * @param $data
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws HttpException in case of error.
   */
  public function post($data) {
    $message = ['error' => 'recaptcha response is missing', 'success' => false];
    if ($captcha_response = $data['captcha_response']) {
      $re_captcha_secret = \Drupal::config('bbd_custom.settings')->get('re_captcha_secret');
      if ($re_captcha_secret) {
        $url = "https://www.google.com/recaptcha/api/siteverify?secret=$re_captcha_secret&response=$captcha_response";
        $recaptcha = file_get_contents($url);
        $recaptcha = json_decode($recaptcha);
        $message = (array)$recaptcha;
      }
      else {
        $message = ['error' => 'recaptcha secret key is missing, check settings.php', 'success' => false];
      }
    }

    return new ModifiedResourceResponse($message);
  }
}

