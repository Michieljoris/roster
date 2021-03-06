/*!
 * Extensible 1.6.0-b1
 * Copyright(c) 2010-2012 Extensible, LLC
 * licensing@ext.ensible.com
 * http://ext.ensible.com
 */
/**
 * @class Extensible.calendar.form.EventWindow
 * @extends Ext.Window
 * <p>A custom window containing a basic edit form used for quick editing of events.</p>
 * <p>This window also provides custom events specific to the calendar so that other calendar components can be easily
 * notified when an event has been edited via this component.</p>
 * <p>The default configs a,e as follows:</p><pre><code>
    // Locale configs
    titleTextAdd: 'Add Event',
    titleTextEdit: 'Edit Event',
    width: 600,
    labelWidth: 65,
    detailsLinkText: 'Edit Details...',
    savingMessage: 'Saving changes...',
    deletingMessage: 'Deleting event...',
    saveButtonText: 'Save',
    deleteButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    notesLabelText: 'Notes',
    datesLabelText: 'When',
    calendarLabelText: 'Calendar',
    
    // General configs
    closeAction: 'hide',
    modal: false,
    resizable: false,
    constrain: true,
    buttonAlign: 'left',
    editDetailsLinkClass: 'edit-dtl-link',
    enableEditDetails: true,
    bodyStyle: 'padding: 8px 10px 5px;',
    layout: 'fit'
</code></pre>
 * @constructor
 * @param {Object} config The config object
 */
Ext.define('Shifts.view.shift.EventWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.shifts.eventeditwindow',
    
    requires: [
        'Ext.form.Panel',
        'Extensible.calendar.data.EventModel',
        'Extensible.calendar.data.EventMappings',
        'Extensible.form.recurrence.RangeEditWindow'
    ],
    
    // Locale configs
    titleTextAdd: 'Add Shift',
    titleTextEdit: 'Edit Shift',
    width: 600,
    labelWidth: 65,
    detailsLinkText: 'Edit Details...',
    savingMessage: 'Saving changes...',
    deletingMessage: 'Deleting shift...',
    saveButtonText: 'Save',
    deleteButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    notesLabelText: 'Notes:',
    locationLabelText: 'Where:',
    datesLabelText: 'When',
    calendarLabelText: 'Who/what:',
    
    // General configs
    closeAction: 'hide',
    modal: false,
    resizable: false,
    constrain: true,
    buttonAlign: 'left',
    editDetailsLinkClass: 'edit-dtl-link',
    enableEditDetails: false,
    layout: 'fit',
    
    formPanelConfig: {
        border: false
    },
    
    /**
     * @cfg {Boolean} allowDefaultAdd
     * @since 1.6.0
     * True to allow the user to save the initial default record displayed in the form while in Add mode
     * and the record is not dirty (default). If false, the form save action will be treated as a cancel action
     * if no editing was performed while in Add mode and the record will not be added. Note that this setting
     * does not apply when in Edit mode. The save action will always be treated as cancel in Edit mode if
     * the form is not dirty.
     *
     * When this option is true any blank or default field values should be allowed by the back end
     * system handling the operation. For example, by default if the event title is blank the calendar views
     * will substitute the value of {@link Extensible.calendar.view.AbstractCalendar#defaultEventTitleText
     * defaultEventTitleText} when displaying it. Any custom fields might require similar custom handling.
     */
    allowDefaultAdd: true,
    
    // private
    initComponent: function(){
        this.addEvents({
            /**
             * @event eventadd
             * Fires after a new event is added
             * @param {Extensible.calendar.form.EventWindow} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel
             * record} that was added
             * @param {Ext.Element} el The target element
             */
            eventadd: true,
            /**
             * @event eventupdate
             * Fires after an existing event is updated
             * @param {Extensible.calendar.form.EventWindow} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel
             * record} that was updated
             * @param {Ext.Element} el The target element
             */
            eventupdate: true,
            /**
             * @event eventdelete
             * Fires after an event is deleted
             * @param {Extensible.calendar.form.EventWindow} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel
             * record} that was deleted
             * @param {Ext.Element} el The target element
             */
            eventdelete: true,
            /**
             * @event eventcancel
             * Fires after an event add/edit operation is canceled by the user and no store update took place
             * @param {Extensible.calendar.form.EventWindow} this
             * @param {Extensible.calendar.data.EventModel} rec The new {@link Extensible.calendar.data.EventModel
             * record} that was canceled
             * @param {Ext.Element} el The target element
             */
            eventcancel: true,
            /**
             * @event editdetails
             * Fires when the user selects the option in this window to continue editing in the detailed edit form
             * (by default, an instance of {@link Extensible.calendar.form.EventDetails}. Handling code should hide
             * this window and transfer the current event record to the appropriate instance of the detailed form by
             * showing it and calling {@link Extensible.calendar.form.EventDetails#loadRecord loadRecord}.
             * @param {Extensible.calendar.form.EventWindow} this
             * @param {Extensible.calendar.data.EventModel} rec The {@link Extensible.calendar.data.EventModel record}
             * that is currently being edited
             * @param {Ext.Element} el The target element
             */
            editdetails: true
        });
        
        this.fbar = this.getFooterBarConfig();
        
        this.callParent(arguments);
    },
    
    getFooterBarConfig: function() {
        var cfg = ['->', {
                text: this.saveButtonText,
                itemId: this.id + '-save-btn',
                disabled: false,
                handler: this.onSave,
                scope: this
            },{
                text: this.deleteButtonText,
                itemId: this.id + '-delete-btn',
                disabled: false,
                handler: this.onDelete,
                scope: this,
                hideMode: 'offsets' // IE requires this
            },{
                text: this.cancelButtonText,
                itemId: this.id + '-cancel-btn',
                disabled: false,
                handler: this.onCancel,
                scope: this
            }];
        
        if(this.enableEditDetails !== false){
            cfg.unshift({
                xtype: 'tbtext',
                itemId: this.id + '-details-btn',
                text: '<a href="#" class="' + this.editDetailsLinkClass + '">' + this.detailsLinkText + '</a>'
            });
        }
        return cfg;
    },
    
    // private
    onRender : function(ct, position){
        this.formPanel = Ext.create('Ext.FormPanel', Ext.applyIf({
            fieldDefaults: {
                labelWidth: this.labelWidth
            },
            items: this.getFormItemConfigs()
        }, this.formPanelConfig));
        
        this.add(this.formPanel);
        
        this.callParent(arguments);
    },
    
    getFormItemConfigs: function() {
	
    var recurField = Ext.createWidget('extensible.recurrencefield', {
        xtype: 'extensible.recurrencefield',
        anchor: '90%',
        listeners: {
            'change': function(field, value) {
		// pp(field.getValue());
                // Ext.get('recur-value').update(field.getValue() || '(Empty string)');
                //Ext.get('recur-desc').update(field.getDescription() || '(Empty string)');
            }
        },
        
        // You can provide an explicit width for the frequency combo, or omit it to allow the
        // default anchor setting (as defined in Extensible.form.recurrence.Fieldset) to take effect.
        // Note that this sets the width of the frequency combo ONLY, not the entire enclosing
        // field container (which can be set separately via the standard width or anchor configs).
        frequencyWidth: 181
        
        // You can set the frequency value explicitly, which will also display the
        // associated sub-fields with their default values. If you are using the value
        // config to populate the recurrence field values then this config is not needed
        // (and will be overridden if the value contains a different frequency).
        // , frequency: 'NONE' 
        
        // Optionally specify the recurrence start date. It will default to the browser's
        // current date, but in most cases if this recurrence rule is tied to some existing
        // event, the event start date would typically be used to initialize the recurrence field.
        //, startDate: Extensible.Date.add(Extensible.Date.today(), {days: 10})
        
        // You can easily initialize the recurrence field with any supported iCal-formatted
        // RRULE string. This takes the exact same value format as what is saved from the
        // field via getValue() and sets all of the internal fields automatically. Note that
        // certain options like BYDAY, BYMONTHDAY, etc. rely on the corresponding start date
        // to match the expected day -- if they do not match the value for that field will
        // simply be left blank.
        //, value: 'FREQ=WEEKLY;INTERVAL=3;BYDAY=MO,FR'
        //, value: 'FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=4;COUNT=10'
        //, value: 'FREQ=MONTHLY;INTERVAL=3;BYDAY=-1WE'
        //, value: 'FREQ=YEARLY;INTERVAL=3;BYMONTH=2;BYDAY=-1WE'
        //, value: 'FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=29;UNTIL=20120531T000000Z'
        //, value: 'FREQ=MONTHLY;INTERVAL=6;BYMONTHDAY=29;COUNT=10'
    });
	
        var items = [
	    ,{
		xtype: 'extensible.daterangefield',
		itemId: this.id + '-dates',
		name: 'dates',
		anchor: '95%',
		singleLine: false,
		fieldLabel: this.datesLabelText
            }
	    ,{
		xtype: 'textfield',
		itemId: this.id + '-location',
		name: Extensible.calendar.data.EventMappings.Location .name,
		fieldLabel: this.locationLabelText,
		anchor: '100%'
            }
	    ,recurField
	    ,{
		xtype: 'textfield',
		itemId: this.id + '-notes',
		name: Extensible.calendar.data.EventMappings.Notes.name,
		fieldLabel: this.notesLabelText,
		anchor: '100%'
            }

	];
        
        if(this.calendarStore){
            items.unshift({
                xtype: 'extensible.calendarcombo',
                itemId: this.id + '-calendar',
                name: Extensible.calendar.data.EventMappings.CalendarId.name,
                anchor: '100%',
                fieldLabel: this.calendarLabelText,
                store: this.calendarStore
            });
        }
        
        return items;
    },

    // private
    afterRender: function(){
        this.callParent(arguments);
		
	this.el.addCls('ext-cal-event-win');
        
        this.initRefs();
        
        // This junk spacer item gets added to the fbar by Ext (fixed in 4.0.2)
        var junkSpacer = this.getDockedItems('toolbar')[0].items.items[0];
        if (junkSpacer.el.hasCls('x-component-default')) {
            Ext.destroy(junkSpacer);
        }
    },
    
    initRefs: function() {
        // toolbar button refs
        this.saveButton = this.down('#' + this.id + '-save-btn');
        this.deleteButton = this.down('#' + this.id + '-delete-btn');
        this.cancelButton = this.down('#' + this.id + '-cancel-btn');
        this.detailsButton = this.down('#' + this.id + '-details-btn');
        
        if (this.detailsButton) {
            this.detailsButton.getEl().on('click', this.onEditDetailsClick, this);
        }
        
        // form item refs
        // this.titleField = this.down('#' + this.id + '-title');
        this.notesField = this.down('#' + this.id + '-notes');
        this.dateRangeField = this.down('#' + this.id + '-dates');
        this.calendarField = this.down('#' + this.id + '-calendar');
    },
    
    // private
    onEditDetailsClick: function(e){
	
        e.stopEvent();
        this.updateRecord(this.activeRecord, true);
        this.fireEvent('editdetails', this, this.activeRecord, this.animateTarget);
    },
	
	/**
     * Shows the window, rendering it first if necessary, or activates it and brings it to front if hidden.
     * @param {Ext.data.Record/Object} o Either a {@link Ext.data.Record} if showing the form
     * for an existing event in edit mode, or a plain object containing a StartDate property (and
     * optionally an EndDate property) for showing the form in add mode.
     * @param {String/Element} animateTarget (optional) The target element or id from which the window should
     * animate while opening (defaults to null with no animation)
     * @return {Ext.Window} this
     */
    show: function(o, animateTarget){
        var me = this,
            EventMappings = Extensible.calendar.data.EventMappings,
            form, rec;
        
		// Work around the CSS day cell height hack needed for initial render in IE8/strict:
		me.animateTarget = (Ext.isIE8 && Ext.isStrict) ? null : animateTarget;

        me.callParent([me.animateTarget, function(){
            me.calendarField.focus(false, 100);
        }, me]);
        
        form = me.formPanel.form;
        
        // Only show the delete button if the data includes an EventID, otherwise
        // we're adding a new record
        me.deleteButton[o.data && o.data[EventMappings.EventId.name] ? 'show' : 'hide']();
        
        if (o.data) {
            rec = o;
			me.setTitle(rec.phantom ? me.titleTextAdd : me.titleTextEdit);
            form.loadRecord(rec);
        }
        else {
            me.setTitle(me.titleTextAdd);

            var start = o[EventMappings.StartDate.name],
                end = o[EventMappings.EndDate.name] || Extensible.Date.add(start, {hours: 1});
                
            rec = Ext.create('Extensible.calendar.data.EventModel');
            
            rec.data[EventMappings.StartDate.name] = start;
            rec.data[EventMappings.EndDate.name] = end;
            
            rec.data[EventMappings.IsAllDay.name] = !!o[EventMappings.IsAllDay.name] ||
                (start.getDate() !== Extensible.Date.add(end, {millis: 1}).getDate());
            
            rec.data[EventMappings.CalendarId.name] = me.calendarStore ?
                    me.calendarStore.getAt(0).data[Extensible.calendar.data.CalendarMappings.CalendarId.name] : '';
            
            if (EventMappings.Duration) {
                rec.data[EventMappings.Duration.name] = Extensible.Date.diff(start, end,
                    Extensible.calendar.data.EventModel.resolution);
            }

            form.reset();
            form.loadRecord(rec);
        }
        
        if (EventMappings.RInstanceStartDate) {
            rec.data[EventMappings.RInstanceStartDate.name] = rec.getStartDate();
        }
        
        me.dateRangeField.setValue(rec.data);
        me.activeRecord = rec;
        
        // Using setValue() results in dirty fields, so we reset the field state
        // after loading the form so that the current values are the "original" values
        form.getFields().each(function(item) {
            item.resetOriginalValue();
        });
        
		return me;
    },
    
    // private
    roundTime: function(dt, incr){
        incr = incr || 15;
        var m = parseInt(dt.getMinutes(), 10);
        return dt.add('mi', incr - (m % incr));
    },
    
    // private
    onCancel: function(){
	
        this.cleanup(true);
		this.fireEvent('eventcancel', this, this.activeRecord, this.animateTarget);
    },

    // private
    cleanup: function(hide){
        if (this.activeRecord) {
            this.activeRecord.reject();
        }
        delete this.activeRecord;
		
        if (hide===true) {
			// Work around the CSS day cell height hack needed for initial render in IE8/strict:
			//var anim = afterDelete || (Ext.isIE8 && Ext.isStrict) ? null : this.animateTarget;
            this.hide();
        }
    },
    
    updateRecord: function(record, keepEditing) {
        var fields = record.fields,
            values = this.formPanel.getForm().getValues(),
            EventMappings = Extensible.calendar.data.EventMappings,
            name,
            obj = {},
            modified;

        fields.each(function(f) {
            name = f.name;
            if (name in values) {
                obj[name] = values[name];
            }
        });
        
        var dates = this.dateRangeField.getValue(),
            allday = obj[EventMappings.IsAllDay.name] = dates[2],
            // Clear times for all day events so that they are stored consistently
            startDate = allday ? Extensible.Date.clearTime(dates[0]) : dates[0],
            endDate = allday ? Extensible.Date.clearTime(dates[1]) : dates[1],
            singleDayDurationConfig = { days: 1 };
        
        // The full length of a day based on the minimum event time resolution:
        singleDayDurationConfig[Extensible.calendar.data.EventModel.resolution] = -1;
        
        obj[EventMappings.StartDate.name] = startDate;
        
        // If the event is all day, calculate the end date as midnight of the day after the end
        // date minus 1 unit based on the EventModel resolution, e.g. 23:59:00 on the end date
        obj[EventMappings.EndDate.name] = allday ?
            Extensible.Date.add(endDate, singleDayDurationConfig) : endDate;
        
        if (EventMappings.Duration) {
            obj[EventMappings.Duration.name] = Extensible.Date.diff(startDate, obj[EventMappings.EndDate.name],
                Extensible.calendar.data.EventModel.resolution);
        }

        record.beginEdit();
        record.set(obj);
        
        if (!keepEditing || !modified) {
            record.endEdit();
        }

        return record.dirty || (record.phantom && this.allowDefaultAdd);
    },
    
    // private
    onSave: function(){
        var me = this,
            form = me.formPanel.form,
            originalHasRecurrence = me.activeRecord.isRecurring();
        
        if (!form.isDirty() && !me.allowDefaultAdd) {
            me.onCancel();
            return;
        }
        if (!form.isValid()) {
            return;
        }
        if (!me.updateRecord(me.activeRecord)) {
            me.onCancel();
            return;
        }
        if (me.activeRecord.phantom) {
            me.fireEvent('eventadd', me, me.activeRecord, me.animateTarget);
        }
        else {
            if (originalHasRecurrence) {
                // We only need to prompt when editing an existing recurring event. If a normal
                // event is edited to make it recurring just do a standard update.
                me.onRecurrenceUpdate();
            }
            else {
                me.fireEvent('eventupdate', me, me.activeRecord, me.animateTarget);
            }
        }
	
            // me.onCancel();
    },
    
    // private
    onRecurrenceUpdate: function() {
        Extensible.form.recurrence.RangeEditWindow.prompt({
            callback: this.onRecurrenceEditModeSelected,
            scope: this
        });
    },
    
    // private
    onRecurrenceEditModeSelected: function(editMode) {
        var me = this;
        
        if (editMode) {
            me.activeRecord.data[Extensible.calendar.data.EventMappings.REditMode.name] = editMode;
            me.fireEvent('eventupdate', me, me.activeRecord, me.animateTarget);
        }
    },
    
    // private
    onDelete: function() {
		this.fireEvent('eventdelete', this, this.activeRecord, this.animateTarget);
    }
});