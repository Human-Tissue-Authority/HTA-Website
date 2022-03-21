<?php
namespace Drupal\bbd_custom\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;

/**
 * @RestResource(
 *   id = "page_not_found_logger",
 *   label = @Translation("Page not found logger"),
 *   uri_paths = {
 *     "canonical" = "/bbd_custom_rest_api/page-not-found-logger"
 *   }
 * )
 */
class PageNotFoundLogger extends ResourceBase {

  /**
   * Responds to entity GET requests.
   * @return \Drupal\rest\ResourceResponse
   */
  public function get() {
    $path = \Drupal::request()->query->get('path');

    if (empty($path)) {
      $response = ['status' => 'failed'];
    }
    else {
      /** @var LoggerChannelFactory $logger */
      $logger = \Drupal::service('logger.factory');
      $logger->get('page not found')->warning('@uri', ['@uri' => $path]);
      $response = ['status' => 'success'];
    }

    $build = [
      '#cache' => [
        'max-age' => 0,
      ],
    ];

    \Drupal::service('page_cache_kill_switch')->trigger();

    return (new ResourceResponse($response))->addCacheableDependency($build);
  }
}
