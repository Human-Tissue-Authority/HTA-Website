<?php
namespace Drupal\bbd_custom\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ModifiedResourceResponse;

/**
 * Set Comment Notify Setting
 *
 * @RestResource(
 *   id = "set_comment_notify",
 *   label = @Translation("Set Comment Notify Setting"),
 *   uri_paths = {
 *     "create" = "/bbd_custom_rest_api/set-comment-notify-setting"
 *   }
 * )
 */
class SetCommentNotify extends ResourceBase {
  /**
   * Responds to entity POST requests and saves the new entity.
   * @param $data
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws HttpException in case of error.
   */
  public function post($data) {
    $message = ['error' => 'comment id is missing or invalid', 'success' => false];
    if ($comment_id = $data['comment_id']) {
      $comment = \Drupal::entityTypeManager()->getStorage('comment')->load($comment_id);
      if ($comment) {
        module_load_include('inc', 'comment_notify', 'comment_notify');

        $status = 0; // don't notify me when new comments are posted
        if ($data['comment_notify'] && $data['comment_notify'] == 1) {
          $status = 1;
        }
        // Save notification settings.
        if (comment_notify_get_notification_type($comment_id)) {
          // Update existing record.
          comment_notify_update_notification($comment_id, $status);
        }
        else {
          $hostname = !$comment->getHostname() ? $comment->getHostname() : '';
          $notify_hash = \Drupal::csrfToken()->get($hostname . $comment->id());
          comment_notify_add_notification($comment->id(), $status, $notify_hash, $comment->notified);
        }
        $message = ['success' => true];
      }

    }

    return new ModifiedResourceResponse($message);
  }
}

