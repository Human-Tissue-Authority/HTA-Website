<?php

namespace Drupal\hta_establishment_widget\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class RemoveXFrameOptionsSubscriber implements EventSubscriberInterface {

  public function RemoveXFrameOptions(FilterResponseEvent $event) {
    $request = \Drupal::request();
    $path = $request->getPathInfo();
    $uri_parts = explode('/establishments/widget-embed/', $path);
    if (!empty($uri_parts) && isset($uri_parts[1]) && is_numeric($uri_parts[1])) {
      $response = $event->getResponse();
      $response->headers->remove('X-Frame-Options');
      $response->setStatusCode(200);
    }
  }

  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['RemoveXFrameOptions', -10];
    return $events;
  }

}

