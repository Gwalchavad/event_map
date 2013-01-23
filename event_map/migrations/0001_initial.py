# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'emObject'
        db.create_table('event_map_emobject', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('uid', self.gf('django.db.models.fields.CharField')(default='b30fc725-4fc9-4390-ba08-1c474b900fef', unique=True, max_length=255)),
        ))
        db.send_create_signal('event_map', ['emObject'])

        # Adding model 'AbstractGroup'
        db.create_table('event_map_abstractgroup', (
            ('emobject_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['event_map.emObject'], unique=True, primary_key=True)),
            ('description', self.gf('django.db.models.fields.TextField')()),
            ('visibility', self.gf('django.db.models.fields.CharField')(default='public', max_length=32)),
            ('posting_option', self.gf('django.db.models.fields.CharField')(default='restricted', max_length=32)),
        ))
        db.send_create_signal('event_map', ['AbstractGroup'])

        # Adding model 'UserGroup'
        db.create_table('event_map_usergroup', (
            ('abstractgroup_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['event_map.AbstractGroup'], unique=True)),
            ('title', self.gf('django.db.models.fields.CharField')(unique=True, max_length=255)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['auth.User'], unique=True, primary_key=True)),
        ))
        db.send_create_signal('event_map', ['UserGroup'])

        # Adding model 'Group'
        db.create_table('event_map_group', (
            ('abstractgroup_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['event_map.AbstractGroup'], unique=True, primary_key=True)),
            ('creator', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.UserGroup'])),
            ('title', self.gf('django.db.models.fields.CharField')(unique=True, max_length=255)),
        ))
        db.send_create_signal('event_map', ['Group'])

        # Adding model 'FeedGroup'
        db.create_table('event_map_feedgroup', (
            ('abstractgroup_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['event_map.AbstractGroup'], unique=True, primary_key=True)),
            ('creator', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.UserGroup'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('feed', self.gf('django.db.models.fields.related.ForeignKey')(related_name='feed_model', to=orm['feed_import.Feed'])),
        ))
        db.send_create_signal('event_map', ['FeedGroup'])

        # Adding model 'Event'
        db.create_table('event_map_event', (
            ('emobject_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['event_map.emObject'], unique=True, primary_key=True)),
            ('author', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='event_author', null=True, to=orm['event_map.UserGroup'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('content', self.gf('django.db.models.fields.TextField')(default='please add some content here')),
            ('slug', self.gf('autoslug.fields.AutoSlugField')(unique=True, max_length=50, populate_from='title', unique_with=())),
            ('date_modified', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('date_created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('start_date', self.gf('django.db.models.fields.DateTimeField')()),
            ('end_date', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('address', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('city', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('venue', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
            ('link', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('contact_info', self.gf('django.db.models.fields.CharField')(max_length=255, null=True, blank=True)),
            ('complete', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('parent_event', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.Event'], null=True, blank=True)),
            ('location_point', self.gf('django.contrib.gis.db.models.fields.PointField')(null=True, blank=True)),
        ))
        db.send_create_signal('event_map', ['Event'])

        # Adding model 'Permission'
        db.create_table('event_map_permission', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('banned', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('read', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('write', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('admin', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('subject', self.gf('django.db.models.fields.related.ForeignKey')(related_name='permissions', to=orm['event_map.AbstractGroup'])),
            ('emobject', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.emObject'])),
        ))
        db.send_create_signal('event_map', ['Permission'])

        # Adding unique constraint on 'Permission', fields ['subject', 'emobject']
        db.create_unique('event_map_permission', ['subject_id', 'emobject_id'])

        # Adding model 'Subscription'
        db.create_table('event_map_subscription', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('subscriber', self.gf('django.db.models.fields.related.ForeignKey')(related_name='subscriber', to=orm['event_map.AbstractGroup'])),
            ('publisher', self.gf('django.db.models.fields.related.ForeignKey')(related_name='publisher', to=orm['event_map.AbstractGroup'])),
        ))
        db.send_create_signal('event_map', ['Subscription'])

        # Adding unique constraint on 'Subscription', fields ['subscriber', 'publisher']
        db.create_unique('event_map_subscription', ['subscriber_id', 'publisher_id'])

        # Adding model 'SubGroupEvent'
        db.create_table('event_map_subgroupevent', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('subscription', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.Subscription'], null=True, blank=True)),
            ('group', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.AbstractGroup'])),
            ('event', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.Event'])),
            ('group_name', self.gf('django.db.models.fields.CharField')(max_length=255, blank=True)),
        ))
        db.send_create_signal('event_map', ['SubGroupEvent'])

        # Adding unique constraint on 'SubGroupEvent', fields ['subscription', 'group', 'event']
        db.create_unique('event_map_subgroupevent', ['subscription_id', 'group_id', 'event_id'])

        # Adding model 'Verbiage'
        db.create_table('event_map_verbiage', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=255)),
            ('content', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('use_markdown', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal('event_map', ['Verbiage'])

        # Adding model 'Notification'
        db.create_table('event_map_notification', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('href', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('to', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.UserGroup'])),
            ('date_created', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('read', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('event_map', ['Notification'])


    def backwards(self, orm):
        # Removing unique constraint on 'SubGroupEvent', fields ['subscription', 'group', 'event']
        db.delete_unique('event_map_subgroupevent', ['subscription_id', 'group_id', 'event_id'])

        # Removing unique constraint on 'Subscription', fields ['subscriber', 'publisher']
        db.delete_unique('event_map_subscription', ['subscriber_id', 'publisher_id'])

        # Removing unique constraint on 'Permission', fields ['subject', 'emobject']
        db.delete_unique('event_map_permission', ['subject_id', 'emobject_id'])

        # Deleting model 'emObject'
        db.delete_table('event_map_emobject')

        # Deleting model 'AbstractGroup'
        db.delete_table('event_map_abstractgroup')

        # Deleting model 'UserGroup'
        db.delete_table('event_map_usergroup')

        # Deleting model 'Group'
        db.delete_table('event_map_group')

        # Deleting model 'FeedGroup'
        db.delete_table('event_map_feedgroup')

        # Deleting model 'Event'
        db.delete_table('event_map_event')

        # Deleting model 'Permission'
        db.delete_table('event_map_permission')

        # Deleting model 'Subscription'
        db.delete_table('event_map_subscription')

        # Deleting model 'SubGroupEvent'
        db.delete_table('event_map_subgroupevent')

        # Deleting model 'Verbiage'
        db.delete_table('event_map_verbiage')

        # Deleting model 'Notification'
        db.delete_table('event_map_notification')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'event_map.abstractgroup': {
            'Meta': {'object_name': 'AbstractGroup', '_ormbases': ['event_map.emObject']},
            'description': ('django.db.models.fields.TextField', [], {}),
            'emobject_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.emObject']", 'unique': 'True', 'primary_key': 'True'}),
            'events': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['event_map.Event']", 'through': "orm['event_map.SubGroupEvent']", 'symmetrical': 'False'}),
            'posting_option': ('django.db.models.fields.CharField', [], {'default': "'restricted'", 'max_length': '32'}),
            'subscriptions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['event_map.AbstractGroup']", 'through': "orm['event_map.Subscription']", 'symmetrical': 'False'}),
            'visibility': ('django.db.models.fields.CharField', [], {'default': "'public'", 'max_length': '32'})
        },
        'event_map.emobject': {
            'Meta': {'object_name': 'emObject'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'uid': ('django.db.models.fields.CharField', [], {'default': "'9f37cd81-6a27-4c10-98c1-e394915f114b'", 'unique': 'True', 'max_length': '255'})
        },
        'event_map.event': {
            'Meta': {'object_name': 'Event', '_ormbases': ['event_map.emObject']},
            'address': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'author': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'event_author'", 'null': 'True', 'to': "orm['event_map.UserGroup']"}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'complete': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'contact_info': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {'default': "'please add some content here'"}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'date_modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'emobject_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.emObject']", 'unique': 'True', 'primary_key': 'True'}),
            'end_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'link': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'location_point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'parent_event': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.Event']", 'null': 'True', 'blank': 'True'}),
            'slug': ('autoslug.fields.AutoSlugField', [], {'unique': 'True', 'max_length': '50', 'populate_from': "'title'", 'unique_with': '()'}),
            'start_date': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'venue': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'})
        },
        'event_map.feedgroup': {
            'Meta': {'object_name': 'FeedGroup', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True', 'primary_key': 'True'}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.UserGroup']"}),
            'feed': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'feed_model'", 'to': "orm['feed_import.Feed']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'event_map.group': {
            'Meta': {'object_name': 'Group', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True', 'primary_key': 'True'}),
            'creator': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.UserGroup']"}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        'event_map.notification': {
            'Meta': {'object_name': 'Notification'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'href': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'to': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.UserGroup']"})
        },
        'event_map.permission': {
            'Meta': {'unique_together': "(('subject', 'emobject'),)", 'object_name': 'Permission'},
            'admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'banned': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'emobject': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.emObject']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'subject': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'permissions'", 'to': "orm['event_map.AbstractGroup']"}),
            'write': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'event_map.subgroupevent': {
            'Meta': {'unique_together': "(('subscription', 'group', 'event'),)", 'object_name': 'SubGroupEvent'},
            'event': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.Event']"}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.AbstractGroup']"}),
            'group_name': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'subscription': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.Subscription']", 'null': 'True', 'blank': 'True'})
        },
        'event_map.subscription': {
            'Meta': {'unique_together': "(('subscriber', 'publisher'),)", 'object_name': 'Subscription'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'publisher': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'publisher'", 'to': "orm['event_map.AbstractGroup']"}),
            'sub_events': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['event_map.Event']", 'through': "orm['event_map.SubGroupEvent']", 'symmetrical': 'False'}),
            'subscriber': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'subscriber'", 'to': "orm['event_map.AbstractGroup']"})
        },
        'event_map.usergroup': {
            'Meta': {'object_name': 'UserGroup', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['auth.User']", 'unique': 'True', 'primary_key': 'True'})
        },
        'event_map.verbiage': {
            'Meta': {'object_name': 'Verbiage'},
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'use_markdown': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        'feed_import.feed': {
            'Meta': {'object_name': 'Feed'},
            'content': ('django.db.models.fields.TextField', [], {}),
            'feed_url': ('django.db.models.fields.URLField', [], {'unique': 'True', 'max_length': '200'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_import': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['event_map']