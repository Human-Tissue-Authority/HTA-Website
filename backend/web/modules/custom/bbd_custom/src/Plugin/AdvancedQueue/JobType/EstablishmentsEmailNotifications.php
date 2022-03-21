<?php

namespace Drupal\bbd_custom\Plugin\AdvancedQueue\JobType;

use Drupal;
use Drupal\advancedqueue\Job;
use Drupal\advancedqueue\JobResult;
use Drupal\advancedqueue\Plugin\AdvancedQueue\JobType\JobTypeBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\webform\Entity\WebformSubmission;

/**
 * @AdvancedQueueJobType(
 *   id = "establishments_email_notifications",
 *   label = @Translation("Establishments Email Notifications"),
 * )
 */
class EstablishmentsEmailNotifications extends JobTypeBase {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function process(Job $job) {
    try {
      $payload = $job->getPayload();
      $entity_id = $payload['entity_id'];
      $entity = Node::load($entity_id);

      hta_feature_establishments_notification_new_report_notify($entity);

      return JobResult::success($this->t('Establishment Email Notifications was sent for node @node', ['@node' => $entity_id]));
    }
    catch (\Exception $e) {
      return JobResult::failure($e->getMessage());
    }
  }

}
