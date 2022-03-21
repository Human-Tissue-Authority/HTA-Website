<?php

namespace Drupal\bbd_custom\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Session limit config form available only for UID 1.
    if ($route = $collection->get('session_limit.config_form')) {
      $route->setRequirement('_session_limit_access_check', 'TRUE');
    }
  }

}
