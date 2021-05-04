<?php

namespace Drupal\hta_establishment_widget;

use Drupal\Core\Url;
use Drupal\file\Entity\File;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\Response;
use Drupal\node\Entity\Node;
use Drupal\media\Entity\Media;

class Widget implements ContainerAwareInterface {

  use ContainerAwareTrait;

  public function embed() {
    $config = \Drupal::config('hta_establishment_widget.admin_settings');

    $request = \Drupal::request();
    $path = $request->getPathInfo();
    $uri_parts = explode('/establishments/widget-embed/', $path);
    // if we are here $path[1] definetly have node id
    $node = Node::load($uri_parts[1]);
    $current_url = str_replace('http://', '', $_SERVER["HTTP_REFERER"]);
    $current_url = str_replace('https://', '', $current_url);

    if ($config->get('hta_establishment_widget_css')) {
      $css = $config->get('hta_establishment_widget_css');
    }
    else {
      $css = 'html,
      body {
        padding: 0;
        margin: 0;
      }
      .hta-licenced-image {
        max-width: 300px;
        height: auto;
        width: 100%;
      }';
    }

    $allowed_websites = $node->field_allowed_websites->value;
    $site_url_match = FALSE;
    if ($allowed_websites) {
      $allowed_websites = str_replace('http://', '', $allowed_websites);
      $allowed_websites = str_replace('https://', '', $allowed_websites);

      if ($current_url) {
        $site_url_match = \Drupal::service('path.matcher')->matchPath($current_url, $allowed_websites);
      }
      else {
        return new Response('Not found');
      }
    }

    if (isset($node) &&  $site_url_match && $node->status == 1) {
      $establishment = $node->field_establishment->target_id;

      $licence_node = Node::load($establishment);

      if ($licence_node && $licence_node instanceof NodeInterface) {
        $licence_link = $licence_node->toUrl()->toString();

        if ($licence_node->hasField('field_hta_licence_status') && !$licence_node->get('field_hta_licence_status')->isEmpty()) {
          $hta_licence_status = $licence_node->field_hta_licence_status->value;

          if ($hta_licence_status && (strtolower($hta_licence_status) == 'licence granted' || strtolower($hta_licence_status) == 'licence suspended')
            && $licence_node->hasField('field_main_licence_number') && !$licence_node->get('field_main_licence_number')->isEmpty()) {
            $licence_id = $licence_node->field_main_licence_number->value;

            $licence_image = [
              '#theme' => 'image',
              '#alt' => t('Human Tissue Authority Licenced Establishment'),
              '#title' => t('Human Tissue Authority Licence ID @licence_number', [
                '@licence_number' => $licence_id,
              ]),
              '#attributes' => [
                'class' => [
                  'hta-licenced-image'
                ],
              ],
            ];

            if ($node->hasField('field_referenced_sector') && !$node->get('field_referenced_sector')->isEmpty()) {
              $term = Term::load($node->field_referenced_sector->target_id);

              if (isset($term) && $term->id()) {
                if ($term->hasField('field_image') && $term->get('field_image') && $term->get('field_image')->getValue()) {
                  $image_id = $term->get('field_image')->target_id;
                  $media_object = Media::load($image_id);
                  if ($media_object && $media_object->hasField('field_media_image')) {
                    $image_values = $media_object->get('field_media_image')->getValue();
                    $image_file_object = File::load($image_values[0]['target_id']);
                    $image_path = $image_file_object->getFileUri();
                  }
                }
              }
            }

            // check for image in config
            if ($config->get('widget_image') && $config->get('widget_image')[0]) {
              $image_file_object = File::load($config->get('widget_image')[0]);
              if (isset($image_file_object)) {
                $image_path = $image_file_object->getFileUri();
              }
            }

            if (!$image_path) {
              $module_path = drupal_get_path('module', 'hta_establishment_widget');
              $image_path = $module_path . '/images/hta_establishment_widget.png';
            }

            $licence_image['#uri'] = $image_path;
            $frontend_base_url = \Drupal::config('bbd_custom.settings')->get('frontend_url');
            $content = [
              '#type' => 'container',
              '#attributes' => [
                'class' => [
                  'container',
                  'hta-establishment-widget',
                ],
              ],
              'image' => [
                '#type' => 'link',
                '#title' => $licence_image,
                '#url' => Url::fromUri($frontend_base_url . $licence_link . '/'),
              ]
            ];

            $js = "
      $('.hta-licenced-link').on('click', function() {
        ga('send', 'event', 'Establishment widgets', 'click', '" . $licence_node->title->value . "');
      });";

            $css = '<style>' . $css . '</style>';

            $html = '<head>
          <title>' . t('HTA Licenced Establishment') . '</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
        <!-- Google hosted JQuery -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
        ' . '<script>$(document).ready(function() {' . $js . '})</script>' . '
        ' . $css . '
        </head>';

            $html .= '<body> ' . render($content) . ' </body></html>';

            return new Response($html);
          }
        }
      }
    }

    return new Response('Not found');
  }

}
