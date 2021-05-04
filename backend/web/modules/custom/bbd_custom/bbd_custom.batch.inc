<?php

use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\webform\Entity\WebformSubmission;

/**
 * Batch update function
 * @param $nid
 * @param $context
 */
function send_email_notifications($data, &$context) {
  $message = 'Sending emails ...';

  $to = $data['email'];

  _bbd_custom_send_email('establishments_email_notifications', $to, $data);
}

/**
 * Batch update function
 * @param $nid
 * @param $context
 */
function send_blog_notifications($cid, $node, &$context) {
  $config = \Drupal::config('bbd_custom.hta_blog_notification_settings');

  $submission = WebformSubmission::load($cid);
  $submission_data = $submission->getData();

  $to = $submission_data['email_address'];
  $first_name = $submission_data['first_name'];
  $last_name = $submission_data['last_name'];

  $body = $config->get('hta_establishments_notification_body') ? $config->get('hta_establishments_notification_body') : t('Dear [first_name], You are receiving this email because you have signed up to be notified when a new blog post is added. You can read the latest post here [node:url:absolute]');
  $token = Drupal::token();
  $body = $token->replace($body, ['node' => $node]);
  $body = str_replace('[first_name]', $first_name, $body);
  $body = str_replace('[last_name]', $last_name, $body);


  $data = [
    'subject' =>  $config->get('hta_establishments_notification_subject') ? $config->get('hta_establishments_notification_subject') : t('New HTA blog available'),
    'body' => $body,
  ];

  _bbd_custom_send_email('blog_email_notifications', $to, $data);
}


/**
 * Batch finish function
 * @param $success
 * @param $results
 * @param $operations
 */
function send_email_notifications_finished ($success, $results, $operations) {
  if ($success) {
    $message = t('Finished successful.');
  }
  else {
    $message = t('Finished with an error.');
  }

  \Drupal::messenger()->addMessage($message);
}
