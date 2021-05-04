<?php

/**
 * @file
 * Contains \Drupal\bbd_eventbrite\Commands\BBDCustomCommands.
 */

namespace Drupal\bbd_custom\Commands;

use Drupal;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drush\Commands\DrushCommands;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Сommands for Drush 9.x.
 */
class BBDCustomCommands extends DrushCommands {
  use StringTranslationTrait;
  /**
   * Process Queues
   *
   * @see #176433986
   *
   * @command bbd_custom:process_queue
   * @aliases process_queue
   */
  public function process_queue() {
    // Comments Email Notifications Queue
    $queue = \Drupal::queue('hta_comments_email_notifications');
    //  time we set for current queue per cron run
    $end = time() + 30;
    $config = \Drupal::config('bbd_custom.hta_comments_notification_settings');

    while (time() < $end && ($item = $queue->claimItem())) {
      if ($item->data && $comment = $item->data['comment']) {
        $email_key = 'hta_comments_email_notifications';
        $to = $config->get('hta_comments_notification_settings_email');

        $node = $comment->getCommentedEntity();
        $body = $config->get('hta_comments_notification_settings_body') ? $config->get('hta_comments_notification_settings_body') : '';
        $token = Drupal::token();
        $body = $token->replace($body, ['node' => $node]);

        $data = [
          'subject' => $config->get('hta_comments_notification_settings_subject') ? $config->get('hta_comments_notification_settings_subject') : '',
          'body' => $body
        ];

        _bbd_custom_send_email ($email_key, $to, $data);

      }

      \Drupal::messenger()->addStatus($this->t(' "comments email notifications" queue item - done' ));

      // Delete  already actioned item from queue
      $queue->deleteItem($item);
    }

    // Blog email notifications
    $queue = \Drupal::queue('hta_blog_email_notifications');
    //  time we set for current queue per cron run
    $end = time() + 60;

    while (time() < $end && ($item = $queue->claimItem())) {
      if ($item->data && $entity = $item->data['entity']) {
        $entity->set('field_notification_sent', 1);
        // get all subscribers
        $query = \Drupal::entityQuery('webform_submission')
          ->condition('webform_id', 'follow_the_hta_blog')
          ->accessCheck(FALSE);
        $result = $query->execute();
        if ($result) {

          foreach ($result as $result_item) {
            $operations[] = [
              'send_blog_notifications',
              [
                $result_item,
                $entity,
                'details' => t('(Sending blog email notifications'),
              ],
            ];

            $batch = array(
              'title' => t('Sending blog email notifications ...'),
              'operations' => $operations,
              'finished' => 'send_email_notifications_finished',
              'file' => drupal_get_path('module', 'bbd_custom') . '/bbd_custom.batch.inc',
            );
            batch_set($batch);
          }
          $entity->save();
        }
      }

      \Drupal::messenger()->addStatus($this->t(' "blog email notifications" queue item - done' ));

      // Delete  already actioned item from queue
      $queue->deleteItem($item);
    }

    // Blog email notifications
    $queue = \Drupal::queue('hta_establishments_email_notifications');
    //  time we set for current queue per cron run
    $end = time() + 60;

    while (time() < $end && ($item = $queue->claimItem())) {
      if ($item->data && $entity = $item->data['entity']) {
        hta_feature_establishments_notification_new_report_notify($entity);
      }

      \Drupal::messenger()->addStatus($this->t(' "establishments email notifications" queue item - done' ));

      // Delete  already actioned item from queue
      $queue->deleteItem($item);
    }
  }
}

