<?php

namespace Drupal\hta_establishment_widget\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;


/**
 * Listener to process request controller information.
 */
class WidgetEmbedSubscriber implements EventSubscriberInterface {
  /**
   * Sets the controller to OverlayController:close() if overlay_display_empty_page()
   * returns TRUE;
   *
   * @param Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   Event that is created to create a response for a request.
   */
  public function onRequestSetController(GetResponseEvent $event) {
    $request = $event->getRequest();

    if ($this->_if_widget_embed_page($request->getPathInfo())) {
      $request->attributes->set('_controller', '\Drupal\hta_establishment_widget\Widget::embed');
    }
  }

  /**
   * Registers the methods in this class that should be listeners.
   *
   * @return array
   *   An array of event listener definitions.
   */
  static function getSubscribedEvents() {
    // The RouterListener has priority 32, and we need to run after that.
    $events[KernelEvents::REQUEST][] = array('onRequestSetController', 30);

    return $events;
  }

  protected function _if_widget_embed_page($uri) {
    $uri_parts = explode('/establishments/widget-embed/', $uri);
    if (!empty($uri_parts) && isset($uri_parts[1]) && is_numeric($uri_parts[1])) {
      return 1;
    }

    return 0;
  }
}

