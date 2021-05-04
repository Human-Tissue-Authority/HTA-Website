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
class HTABlogSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'hta_blog_notification_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'bbd_custom.hta_blog_notification_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_blog_notification_settings');

    $form['hta_blog_notification_settings_subject'] = [
      '#title' => $this->t('Subject'),
      '#type' => 'textfield',
      '#default_value' => $config->get('hta_blog_notification_settings_subject') ? $config->get('hta_blog_notification_settings_subject') : '',
    ];

    $form['hta_blog_notification_settings_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('hta_blog_notification_settings_body') ? $config->get('hta_blog_notification_settings_body') : '',
      '#description' => $this->t(' Avaliable tokens : [first_name] , [last_name], [node:url:absolute], [node:title]'),
    ];

    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_blog_notification_settings');
    $config->set('hta_blog_notification_settings_subject', $form_state->getValue('hta_blog_notification_settings_subject'));
    $config->set('hta_blog_notification_settings_body', $form_state->getValue('hta_blog_notification_settings_body'));

    $config->save();

    drupal_flush_all_caches();
    parent::submitForm($form, $form_state);
  }
}
