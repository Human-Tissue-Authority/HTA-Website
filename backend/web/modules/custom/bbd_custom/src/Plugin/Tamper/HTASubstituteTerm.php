<?php

namespace Drupal\bbd_custom\Plugin\Tamper;

use Drupal\tamper\Exception\TamperException;
use Drupal\tamper\TamperableItemInterface;
use Drupal\tamper\TamperBase;

/**
 * Plugin implementation for Substitute Term items.
 *
 * @Tamper(
 *   id = "substitute_term",
 *   label = @Translation("Substitute Term"),
 *   category = "Text"
 * )
 */
class HTASubstituteTerm extends TamperBase {

  /**
   * {@inheritdoc}
   */
  public function tamper($data, TamperableItemInterface $item = NULL) {
    if (!is_string($data)) {
      throw new TamperException('Input should be a string.');
    }

    if ($label_activity = $this->replace_label($data)) {
      $data = $label_activity;
    }
    return $data;
  }

  private function replace_label($crm_key) {
    $activities_keys = array(
      // A_
      'a_examination' => 'Anatomical Examination',
      'a_removal' => 'Removal of Relevant Material',
      'a_storage_body' => 'Storage of a Body or Relevant Material',
      'a_storage_specimen' => 'Storage of an Anatomical Specimen',
      // HA_
      'ha_distribution'=> 'Distribution',
      'ha_donation' => 'Donation',
      'ha_export'=> 'Export',
      'ha_import'=> 'Import',
      'ha_processing'=> 'Processing',
      'ha_procurement'=> 'Procurement',
      'ha_storage'=> 'Storage',
      'ha_storage_rm'=> 'Storage of Relevant Material (Human Tissue Act)',
      'ha_testing'=> 'Testing',
      // ODTP_
      'odtp_donorchar' => 'Donor Characterisation',
      'odtp_organchar' => 'Organ Characterisation',
      'odtp_preservation' => 'Preservation of an organ',
      'odtp_retrieval' => 'Retrieval of an organ',
      'odtp_transport' => 'Making arrangements to transport an organ',
      // ODTT_
      'odtt_application' => 'Transplantation - Application for a licence to cover',
      'odtt_implantation' => 'Implantation of an organ',
      'odtt_organchar' => 'Organ Characterisation',
      'odtt_preservation' => 'Preservation of an organ',
      'odtt_transport' => 'Making arrangements to transport an organ',
      // PD_
      'pd_display' => 'Use for Public Display',
      'pd_storage' => 'Storage of a Body or Relevant Material',
      // PM_
      'pm_examination' => 'Making of a Post Mortem Examination',
      'pm_removal' => 'Removal of Relevant Material',
      'pm_storage' => 'Storage of a Body or Relevant Material',
      // R_
      'r_removal' => 'Removal of Relevant Material',
      'r_storage' => 'Storage of Relevant Material',
    );

    if (isset($activities_keys[$crm_key])) {
      return $activities_keys[$crm_key];
    }

    return FALSE;
  }

}

