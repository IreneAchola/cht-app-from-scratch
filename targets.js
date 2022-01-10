const isPatient = (contact) => contact.contact && contact.contact.type === 'person' && contact.contact.parent && contact.contact.parent.parent && contact.contact.parent.parent.parent;
const getHouseholdId = (contact) => contact.contact && contact.contact.type === 'clinic' ? contact.contact._id : contact.contact.parent && contact.contact.parent._id;

module.exports = [
  {
    id: 'assessments-all-time',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: -1,
    translation_key: 'targets.assessments.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    idType: 'report',
    date: 'now'
  },
  {
    id: 'assessments-this-month',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: 2,
    translation_key: 'targets.assessments.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    idType: 'report',
    date: 'reported'
  },
  {
    id: 'total-contacts-with-cough-this-month',
    type: 'count',
    icon: 'icon-cough',
    goal: -1,
    translation_key: 'targets.assessments.total.cough.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'group_assessment.cough') === 'yes';
    },
    idType: 'contact',
    date: 'reported'
  },
  {
    id: 'percentage-contacts-with-cough-this-month',
    type: 'percent',
    icon: 'icon-cough',
    goal: -1,
    translation_key: 'targets.assessments.percentage.cough.title',
    percentage_count_translation_key: 'targets.assessments.percentage.with.cough',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact) {
      return contact.contact && contact.contact.parent && contact.contact.parent.parent && contact.contact.parent.parent.parent;
    },
    passesIf: function(contact, report) {
      return Utils.getField(report, 'group_assessment.cough') === 'yes';
    },
    idType: 'contact',
    date: 'reported'
  },
  //Total number of households with at least one submitted assessment form
  {
    id: 'households-with-assessments-this-month',
    type: 'count',
    icon: 'icon-household',
    goal: 2,
    translation_key: 'targets.households.with.assessments.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    emitCustom: (emit, original, contact) => {
      const householdId = contact.contact && contact.contact.parent._id;
      emit(Object.assign({}, original, {
        _id: householdId,
        pass: true
      }));
    }
  },

  {
    id: 'households-with-gt2-assessments-this-month-2',
    type: 'percent',
    icon: 'icon-household',
    goal: 60,
    translation_key: 'targets.households.with.gt2.assessments.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'contacts',
    appliesToType: ['person', 'clinic'], //Need the total number of households as denominator
    date: 'now',
    emitCustom: (emit, original, contact) => {
      const householdId = getHouseholdId(contact);
      if (isPatient(contact) && contact.reports.some(report => report.form === 'assessment')) {
          emit(Object.assign({}, original, {
            _id: householdId, //Emits a passing target instance with the household ID as the target instance ID
            pass: true
          }));
      }
      if(contact.contact && contact.contact.type === 'clinic') { //This represents the denominator, which is the total number of households
        emit(Object.assign({}, original, {
          _id: householdId,
          pass: false, //Set to false so that it is counted in the denominator
        }));
      }
    },
    groupBy: contact => getHouseholdId(contact),
    passesIfGroupCount: { gte: 2 },
  }
];