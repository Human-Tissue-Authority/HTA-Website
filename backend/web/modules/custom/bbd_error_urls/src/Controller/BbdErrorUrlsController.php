<?php

namespace Drupal\bbd_error_urls\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for bbd_error_urls routes.
 */
class BbdErrorUrlsController extends ControllerBase {

  /**
   * The Database Connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('database'));
  }

  /**
   * TableSortExampleController constructor.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   */
  public function __construct(Connection $database) {
    $this->database = $database;
  }

  /**
   * A simple controller method to explain what the tablesort example is about.
   *
   * @return $build
   *   return render build array.
   */
  public function tableList() {
    $header = [
      ['data' => $this->t('COUNT'), 'field' => 't.count'],
      ['data' => $this->t('URL'), 'field' => 't.url'],
    ];

    // Using the TableSort Extender is what tells  the query object that we
    // are sorting.
    $query = $this->database->select('bbd_error_urls', 't')->fields('t');

    $table_sort = $query->extend('Drupal\Core\Database\Query\TableSortExtender')->orderByHeader($header);
    // Limit the rows to 20 for each page.
    $pager = $table_sort->extend('Drupal\Core\Database\Query\PagerSelectExtender')->limit(20);

    $result = $pager->execute();
    $result = $query->execute();

    $rows = [];
    foreach ($result as $row) {
      $rows[] = ['data' => $row];
    }

    $build = [
      '#type' => 'container',
      'table_title' => [
        '#type' => 'html_tag',
        '#tag' => 'h4',
        '#value' => $this->t('List of all 404 page not found urls.'),
      ],
      'tablesort_table' => [
        '#theme' => 'table',
        '#header' => $header,
        '#rows' => $rows,
      ],
      'pager' => [
        '#type' => 'pager',
      ],
    ];

    return $build;
  }

}
