import { fetchAuthed } from "./utils"

// options: keywords, itemsPerPage, offset, queryFilters, querySort
export function fetchSearchResults(options) {
  const keywords = options.keywords || '*'
  const itemsPerPage = options.itemsPerPage || 9
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || ''

  const fields = 'ss_title,ds_changed,ds_created,tm_X3b_en_body,sm_tags,sm_audience,ss_type,ss_alias,its_nid,sm_sector_tags,ss_field_news_type'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=tm_X3b_en_field_search_all:${keywords}&fl=${fields}&fq=ss_type:(blog establishment foi medical_school meeting article page vacancy)`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchEstablishments(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || '&sort=ss_field_main_licence_number asc'

  const fields = 'ss_alias,ss_title,ss_field_main_licence_number,sm_sector_tags,bs_field_satellites_are_linked_to_a,ss_field_hta_licence_status,its_nid'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:establishment&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchCurrentVacancies(options) {
  const offset = options.offset || 0
  const sort = '&sort=ds_field_date asc'

  const fields = 'its_nid,ss_title,ds_created,tm_X3b_en_body,ds_field_date,ss_alias,ss_summary'
  const baseQuery = `/select?wt=json&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:vacancy&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + sort)
}

export function fetchEvents(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || '&sort=ds_field_date asc'

  const fields = 'ss_alias,sm_tags,ss_title,its_nid,ss_field_news_type,tm_X3b_en_body,ss_summary,ss_field_date,ss_field_contact_telephone,ss_field_contact_name,ss_field_contact_email,ss_field_venue,ds_field_date'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_field_news_type:Event&fq=ss_type:article&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchNews(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || '&sort=bs_field_featured desc, ds_field_date desc'

  const fields = 'ss_alias,sm_tags,ss_title,its_nid,ss_field_news_type,tm_X3b_en_body,ss_summary,ds_field_date,sm_audience,sm_sector_tags,bs_field_featured'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_field_news_type:News&fq=ss_type:article&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchFoi(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || '&sort=ds_field_date desc'

  const fields = 'ss_alias,sm_tags,ss_title,its_nid,ss_field_news_type,tm_X3b_en_body,ss_summary,ds_field_date,sm_audience,sm_sector_tags,sm_url_1,itm_field_attachment'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:foi&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchBlogPosts(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryCategories || ''
  const sort = '&sort=ds_created desc'

  const fields = 'ss_title,its_nid,ds_created,sm_tags,ss_alias,sm_audience,tm_X3b_en_body'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:blog&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchMedicalSchools(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''
  const sort = options.querySort || '&sort=ss_title asc'

  const fields = 'ss_title,ss_field_contact_name,ss_field_contact_telephone,its_nid,tm_X3b_en_postcodes,ss_url_alias'
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:medical_school&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters + sort)
}

export function fetchMeetings(options) {
  const itemsPerPage = options.itemsPerPage || 20
  const offset = options.offset || 0
  const filters = options.queryFilters || ''

  const fields = `
    its_nid,
    ss_title,
    ss_url_alias,
    ds_field_date,
    tm_X3b_en_family_tag
  `
  const baseQuery = `/select?wt=json&rows=${itemsPerPage}&start=${offset}&q=*:*&fl=${fields}&fq=ss_type:meeting&fq=bs_status:true`

  return fetchAuthed(process.env.SOLR_ROOT + baseQuery + filters)
}