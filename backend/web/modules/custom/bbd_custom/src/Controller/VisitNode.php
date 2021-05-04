<?php

namespace Drupal\bbd_custom\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\node\NodeInterface;

 /**
 * Provides Redirect to frontend
 */
class VisitNode extends ControllerBase {
  /**
   * {@inheritdoc}
   */
  public function redirectFrontend (NodeInterface $node) {
    // Get Frontend base url
    $frontend_base_url = \Drupal::config('bbd_custom.settings')->get('frontend_url');

    // Get node alias
    $alias = \Drupal::service('path_alias.manager')->getAliasByPath('/node/'. $node->id());

    return new TrustedRedirectResponse($frontend_base_url . $alias);
  }
}
