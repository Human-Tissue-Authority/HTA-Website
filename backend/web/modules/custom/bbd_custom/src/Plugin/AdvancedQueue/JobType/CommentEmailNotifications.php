<?php

namespace Drupal\bbd_custom\Plugin\AdvancedQueue\JobType;

use Drupal;
use Drupal\advancedqueue\Job;
use Drupal\advancedqueue\JobResult;
use Drupal\advancedqueue\Plugin\AdvancedQueue\JobType\JobTypeBase;
use Drupal\comment\Entity\Comment;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\webform\Entity\WebformSubmission;

/**
 * @AdvancedQueueJobType(
 *   id = "comment_email_notifications",
 *   label = @Translation("Comment Email Notifications"),
 * )
 */
class CommentEmailNotifications extends JobTypeBase {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function process(Job $job) {
    try {
      $payload = $job->getPayload();
      $entity_id = $payload['comment_id'];
      $comment = Comment::load($entity_id);
      $config = \Drupal::config('bbd_custom.hta_comments_notification_settings');

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

      _bbd_custom_send_email($email_key, $to, $data);

      return JobResult::success($this->t('Comment Email Notifications was sent for comment @node', ['@node' => $entity_id]));
    }
    catch (\Exception $e) {
      return JobResult::failure($e->getMessage());
    }
  }

}
