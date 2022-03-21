<?php

namespace Drupal\bbd_custom\Plugin\AdvancedQueue\JobType;

use Drupal;
use Drupal\advancedqueue\Entity\Queue;
use Drupal\advancedqueue\Job;
use Drupal\advancedqueue\JobResult;
use Drupal\advancedqueue\Plugin\AdvancedQueue\JobType\JobTypeBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\webform\Entity\WebformSubmission;

/**
 * @AdvancedQueueJobType(
 *   id = "blog_email_notifications",
 *   label = @Translation("Blog Email Notifications"),
 * )
 */
class BlogEmailNotifications extends JobTypeBase {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function process(Job $job) {
    try {
      $payload = $job->getPayload();
      $entity_id = $payload['entity_id'];
      $entity = Node::load($entity_id);
      $entity->set('field_notification_sent', 1);
      // get all subscribers
      $query = \Drupal::entityQuery('webform_submission')
        ->condition('webform_id', 'follow_the_hta_blog')
        ->accessCheck(FALSE);
      $result = $query->execute();
      if ($result) {
        $config = \Drupal::config('bbd_custom.hta_blog_notification_settings');

        foreach ($result as $cid) {
          $submission = WebformSubmission::load($cid);
          $submission_data = $submission->getData();

          $to = $submission_data['email_address'];
          $first_name = $submission_data['first_name'];
          $last_name = $submission_data['last_name'];

          $body = $config->get('hta_establishments_notification_body') ? $config->get('hta_establishments_notification_body') : $this->t('Dear [first_name], You are receiving this email because you have signed up to be notified when a new blog post is added. You can read the latest post here [node:url:absolute]');
          $token = Drupal::token();
          $body = $token->replace($body, ['node' => $entity]);
          $body = str_replace('[first_name]', $first_name, $body);
          $body = str_replace('[last_name]', $last_name, $body);

          $data = [
            'subject' => $config->get('hta_establishments_notification_subject') ? $config->get('hta_establishments_notification_subject') : $this->t('New HTA blog available'),
            'body' => $body,
          ];

          $payload = [
            'type' => 'blog_email_notifications',
            'to' => $to,
            'data' => $data
          ];

          $job = Job::create('send_email', $payload);
          $queue = Queue::load('send_email');
          $queue->enqueueJob($job);
        }

        $entity->save();
      }

      return JobResult::success($this->t('Blog Email Notifications was sent for node @node', ['@node' => $entity_id]));
    }
    catch (\Exception $e) {
      return JobResult::failure($e->getMessage());
    }
  }

}
