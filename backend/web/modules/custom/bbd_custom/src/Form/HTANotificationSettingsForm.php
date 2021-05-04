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
class HTANotificationSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'hta_establishments_notification_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'bbd_custom.hta_establishments_notification_admin_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_establishments_notification_admin_settings');

    $form['hta_establishments_notification_report_notify'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Notify user when a new report is uploaded for an establishment'),
      '#default_value' => $config->get('hta_establishments_notification_report_notify') ? $config->get('hta_establishments_notification_report_notify') : 0,
    ];

    $form['hta_establishments_notification_subject'] = [
      '#title' => $this->t('Subject'),
      '#type' => 'textfield',
      '#default_value' => $config->get('hta_establishments_notification_subject') ? $config->get('hta_establishments_notification_subject') : '',
    ];

    $form['hta_establishments_notification_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('hta_establishments_notification_body') ? $config->get('hta_establishments_notification_body') : '',
    ];

    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_establishments_notification_admin_settings');

    $config->set('hta_establishments_notification_report_notify', $form_state->getValue('hta_establishments_notification_report_notify'));
    $config->set('hta_establishments_notification_subject', $form_state->getValue('hta_establishments_notification_subject'));
    $config->set('hta_establishments_notification_body', $form_state->getValue('hta_establishments_notification_body'));

    $config->save();

    drupal_flush_all_caches();
    parent::submitForm($form, $form_state);
  }
}
