<?php

/**
 * @file
 * Contains \Drupal\bbd_eventbrite\Commands\BBDCustomCommands.
 */

namespace Drupal\hta_establishment_widget\Commands;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drush\Commands\DrushCommands;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Сommands for Drush 9.x.
 */
class HtaEstablishmentCustomCommands extends DrushCommands {
  use StringTranslationTrait;
  /**
   * Updates all documents
   *
   * @command hta_establishment_widget:validate_licence_for_widget
   * @aliases validate_licence_for_widget
   */
  public function validate_licence_for_widget() {

    $nids = \Drupal::entityQuery('node')
      ->condition('type', 'establishment_widget')
      ->execute();
    if ($nids) {
      $nodes = Node::loadMultiple($nids);

      if ($nodes) {
        foreach ($nodes as $node) {
          if ($node->hasField('field_establishment') && $node->field_establishment && $node->field_establishment->target_id) {
            $establishment = $node->field_establishment->target_id;
            $licence_node = Node::load($establishment);
            if ($licence_node && $licence_node->hasField('field_hta_licence_status') && $licence_node->field_hta_licence_status->value) {
              $hta_licence_status = $licence_node->field_hta_licence_status->value;
              if ($hta_licence_status && (strtolower($hta_licence_status) == 'licence granted' || strtolower($hta_licence_status) == 'licence suspended')) {
                $node->status = 1;
              }
              else {
                $node->status = 0;
              }
            }
            else {
              $node->status = 0;
            }
          }
          else {
            $node->status = 0;
          }
        }

        $node->save();
      }
    }
  }
}

