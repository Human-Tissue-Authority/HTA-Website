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
class HTACookieBannerSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'hta_cookie_banner_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'bbd_custom.hta_cookie_banner_admin_settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_cookie_banner_admin_settings');

    $form['hta_cookie_banner_enable_popup'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable popup'),
      '#default_value' => $config->get('hta_cookie_banner_enable_popup') ? $config->get('hta_cookie_banner_enable_popup') : 0,
    ];

    $form['hta_cookie_banner_cookie_settings'] = [
      '#title' => $this->t('Cookie Settings'),
      '#type' => 'textfield',
      '#default_value' => $config->get('hta_cookie_banner_cookie_settings') ? $config->get('hta_cookie_banner_cookie_settings') : '',
    ];


    return parent::buildForm($form, $form_state);
  }


  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('bbd_custom.hta_cookie_banner_admin_settings');
    $config->set('hta_cookie_banner_enable_popup', $form_state->getValue('hta_cookie_banner_enable_popup'));
    $config->set('hta_cookie_banner_cookie_settings', $form_state->getValue('hta_cookie_banner_cookie_settings'));

    $config->save();

    drupal_flush_all_caches();
    parent::submitForm($form, $form_state);
  }
}
