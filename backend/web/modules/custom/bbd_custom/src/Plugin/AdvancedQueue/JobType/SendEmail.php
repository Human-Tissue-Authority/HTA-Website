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
 *   id = "send_email",
 *   label = @Translation("Send Email"),
 * )
 */
class SendEmail extends JobTypeBase {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function process(Job $job) {
    try {
      $payload = $job->getPayload();
      $to = $payload['to'];
      $data = $payload['data'];
      $type = $payload['type'];

      _bbd_custom_send_email($type, $to, $data);

      return JobResult::success($this->t('Email Was sent to @to', ['@to' => $to]));
    }
    catch (\Exception $e) {
      return JobResult::failure($e->getMessage());
    }
  }

}
