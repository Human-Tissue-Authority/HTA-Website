<?php

namespace Drupal\bbd_custom\Plugin\Tamper;

use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\Node;
use Drupal\tamper\Exception\TamperException;
use Drupal\tamper\TamperableItemInterface;
use Drupal\tamper\TamperBase;

/**
 * Plugin implementation for Unpublish Test items.
 *
 * @Tamper(
 *   id = "unpublish_test",
 *   label = @Translation("Unpublish Test items"),
 *   description = @Translation("Unpublish Test items"),
 *   category = "Text"
 * )
 */
class UnpublishTests extends TamperBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    $config = parent::defaultConfiguration();
    $config['unpublish_test_license_number'] = '';
    return $config;
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {

    $form['unpublish_test_license_number'] = [
      '#type' => 'textfield',
      '#title' => t('License number to unpublish'),
      '#default_value' => ($this->getSetting('unpublish_test_license_number')) ? $this->getSetting('unpublish_test_license_number') : '',
      '#size' => 60,
      '#maxlength' => 128,
      '#required' => TRUE
    ];

    return $form;

  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $this->setConfiguration([
      'unpublish_test_license_number' => $form_state->getValue('unpublish_test_license_number')
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function tamper($data, TamperableItemInterface $item = NULL) {
    if (!is_string($data)) {
      throw new TamperException('Input should be a string.');
    }

    $unpublish_test_license_number = $this->getSetting('unpublish_test_license_number');

    if ($unpublish_test_license_number) {

      $query = \Drupal::entityQuery('node')
        ->condition('type', 'establishment')
        ->condition('field_main_licence_number', $unpublish_test_license_number);

      $nids = $query->execute();
      if ($nids) {
        $nodes = Node::loadMultiple($nids);
        foreach ($nodes as $node) {
          $node->status = 0;
          $node->save();
        }
      }
    }
    return $data;
  }
}

