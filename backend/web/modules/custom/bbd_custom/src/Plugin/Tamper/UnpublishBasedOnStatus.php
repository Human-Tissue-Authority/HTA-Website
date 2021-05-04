<?php

namespace Drupal\bbd_custom\Plugin\Tamper;

use Drupal\tamper\Exception\TamperException;
use Drupal\tamper\TamperableItemInterface;
use Drupal\tamper\TamperBase;

/**
 * Plugin implementation for Unpublish Test items.
 *
 * @Tamper(
 *   id = "unpublish_based_on_status",
 *   label = @Translation("Unpublish Based On Status"),
 *   description = @Translation("Publish only license with License Granted or Licence Suspended statuses - all other unpublish for now"),
 *   category = "Text"
 * )
 */
class UnpublishBasedOnStatus extends TamperBase {

  /**
   * {@inheritdoc}
   */
  public function tamper($data, TamperableItemInterface $item = NULL) {
    if (!is_string($data)) {
      throw new TamperException('Input should be a string.');
    }

    $source = $item->getSource();
    if (isset($source['status']) && ($source['status'] == 'Licence Granted' || $source['status'] == 'Licence Suspended')) {
      $data = 'published'; // Published
    }
    else {
      $data = 'unpublished'; // Unpublished
    }

    return $data;
  }
}
