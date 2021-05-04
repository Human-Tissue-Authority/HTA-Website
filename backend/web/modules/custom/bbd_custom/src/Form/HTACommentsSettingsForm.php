<?php

/**
 * @file
 * Contains \Drupal\jmpp_custom\Form\JMPPSettingsForm.
 */

namespace Drupal\bbd_custom\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\file\Entity\File;
use Drupal\link\LinkItemInterface;
use Drupal\Core\Entity\Element\EntityAutocomplete;

/**
 * Configure settings.
 */
class HTACommentsSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'hta_comments_notification_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'bbd_custom.hta_comments_notification_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_comments_notification_settings');

    $form['hta_comments_notification_settings_notify'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Notify HTA Admin when each comment is submitted'),
      '#default_value' => $config->get('hta_comments_notification_settings_notify') ? $config->get('hta_comments_notification_settings_notify') : 0,
    ];

    $form['hta_comments_notification_settings_email'] = [
      '#title' => $this->t('Email'),
      '#type' => 'textfield',
      '#default_value' => $config->get('hta_comments_notification_settings_email') ? $config->get('hta_comments_notification_settings_email') : 'media@hta.gov.uk',
    ];

    $form['hta_comments_notification_settings_subject'] = [
      '#title' => $this->t('Subject'),
      '#type' => 'textfield',
      '#default_value' => $config->get('hta_comments_notification_settings_subject') ? $config->get('hta_comments_notification_settings_subject') : '',
    ];

    $form['hta_comments_notification_settings_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('hta_comments_notification_settings_body') ? $config->get('hta_comments_notification_settings_body') : '',
      '#description' => $this->t(' Avaliable tokens : [node:url:absolute], [node:title]'),
    ];

    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_comments_notification_settings');

    $config->set('hta_comments_notification_settings_notify', $form_state->getValue('hta_comments_notification_settings_notify'));
    $config->set('hta_comments_notification_settings_subject', $form_state->getValue('hta_comments_notification_settings_subject'));
    $config->set('hta_comments_notification_settings_email', $form_state->getValue('hta_comments_notification_settings_email'));
    $config->set('hta_comments_notification_settings_body', $form_state->getValue('hta_comments_notification_settings_body'));

    $config->save();

    drupal_flush_all_caches();
    parent::submitForm($form, $form_state);
  }
}
