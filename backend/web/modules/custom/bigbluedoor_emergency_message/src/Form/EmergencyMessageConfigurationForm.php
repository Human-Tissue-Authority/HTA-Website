<?php

/**
 * @file
 * Contains \Drupal\bigbluedoor_emergency_message\Form\EmergencyMessageConfigurationForm.
 */

namespace Drupal\bigbluedoor_emergency_message\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\media\Entity\Media;
use Drupal\media\MediaInterface;

/**
 * Defines a form that configures forms module settings.
 */
class EmergencyMessageConfigurationForm extends ConfigFormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'bigbluedoor_emergency_message_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'bigbluedoor_emergency_message.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('bigbluedoor_emergency_message.settings');

    $form['popup_enabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Emergency popup enabled'),
      '#default_value' => !empty($config->get('popup_enabled')) ? $config->get('popup_enabled') : FALSE,
    ];

    $form['notice_title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Title'),
      '#default_value' => !empty($config->get('notice_title')) ? $config->get('notice_title') : '',
    ];

    $notice_text = !empty($config->get('notice_text')) ? $config->get('notice_text') : ['value' => '', 'format' => 'full_html'];
    $form['notice_text'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Body'),
      '#default_value' => $notice_text['value'],
      '#format' => $notice_text['format'],
    ];

    $form['open_button_text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Open notice button text'),
      '#default_value' => !empty($config->get('open_button_text')) ? $config->get('open_button_text') : $this->t('Display alert'),
    ];

    $form['path_exclusions'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Path Exclusions'),
      '#default_value' => $config->get('path_exclusions') ? $config->get('path_exclusions') : '',
      '#description' => $this->t('Add one site URL per row. Use * as a wildcard, for example, use "https://www.hta.gov.uk/*" to be used across the site.')
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $uuid_service = \Drupal::service('uuid');
    $values = $form_state->getValues();

    $this->config('bigbluedoor_emergency_message.settings')
      ->set('popup_enabled', $values['popup_enabled'])
      ->set('notice_title', $values['notice_title'])
      ->set('notice_text', $values['notice_text'])
      ->set('open_button_text', $values['open_button_text'])
      ->set('path_exclusions', $values['path_exclusions'])
      ->set('form_submission_uuid', $uuid_service->generate())
      ->save();
    drupal_flush_all_caches();
  }
}
