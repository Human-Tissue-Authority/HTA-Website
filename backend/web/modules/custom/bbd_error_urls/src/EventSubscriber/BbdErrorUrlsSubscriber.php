<?php

namespace Drupal\bbd_error_urls\EventSubscriber;

use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use \Drupal\Core\Database\Connection;

/**
 * bbd_error_urls event subscriber.
 */
class BbdErrorUrlsSubscriber implements EventSubscriberInterface {

  /**
   * The messenger.
   *
   * @var MessengerInterface
   */
  protected MessengerInterface $messenger;

  private Connection $database;

  /**
   * Constructs event subscriber.
   *
   * @param MessengerInterface $messenger
   *   The messenger.
   */
  public function __construct(MessengerInterface $messenger) {
    $this->messenger = $messenger;
    $this->database = \Drupal::database();
  }

  /**
   * Create or Update bbd_error_urls table row
   *
   * @param String $pathInfo
   *
   * @throws \Exception
   */
  private function createOrUpdateDB(string $pathInfo) {
    $finder = $this->database->select('bbd_error_urls', 'u');

    // Add extra detail to this query object: a condition, fields and a range.
    $finder->condition('u.url', $pathInfo, '=');
    $finder->fields('u', ['url', 'count']);
    $finder->distinct();
    $result = $finder->execute()->fetchAll();

    try {
      if (count($result) == 1) {
        $this->database->update('bbd_error_urls')->fields([
            'count' => $result[0]->count + 1,
          ])->condition('url', $result[0]->url, '=')->execute();
      }
      else {
        $this->database->insert('bbd_error_urls')->fields([
            'count' => 1,
            'url' => $pathInfo,
          ])->execute();
      }
    } catch (Exception $e) {
      watchdog_exception('type', $e);
    }
  }

  /**
   * Kernel Controller function
   *
   * @param $event
   */
  public function onKernelController($event) {
    $request = $event->getRequest();
    if ($request->attributes->get('exception')) {
      $code = $request->attributes->get('exception')->getStatusCode();
      $pathInfo = $request->getPathInfo();

      if ($code == 404) {
        $this->createOrUpdateDB($pathInfo);
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      KernelEvents::CONTROLLER => ['onKernelController', 100],
    ];
  }

}
