# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing M2M table for field groups on 'Event'
        db.delete_table('event_map_event_groups')

        # Adding M2M table for field connections on 'emObject'
        db.create_table('event_map_emobject_connections', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_emobject', models.ForeignKey(orm['event_map.emobject'], null=False)),
            ('to_emobject', models.ForeignKey(orm['event_map.emobject'], null=False))
        ))
        db.create_unique('event_map_emobject_connections', ['from_emobject_id', 'to_emobject_id'])

        # Removing M2M table for field subscription on 'AbstractGroup'
        db.delete_table('event_map_abstractgroup_subscription')


    def backwards(self, orm):
        # Adding M2M table for field groups on 'Event'
        db.create_table('event_map_event_groups', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('event', models.ForeignKey(orm['event_map.event'], null=False)),
            ('abstractgroup', models.ForeignKey(orm['event_map.abstractgroup'], null=False))
        ))
        db.create_unique('event_map_event_groups', ['event_id', 'abstractgroup_id'])

        # Removing M2M table for field connections on 'emObject'
        db.delete_table('event_map_emobject_connections')

        # Adding M2M table for field subscription on 'AbstractGroup'
        db.create_table('event_map_abstractgroup_subscription', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_abstractgroup', models.ForeignKey(orm['event_map.abstractgroup'], null=False)),
            ('to_abstractgroup', models.ForeignKey(orm['event_map.abstractgroup'], null=False))
        ))
        db.create_unique('event_map_abstractgroup_subscription', ['from_abstractgroup_id', 'to_abstractgroup_id'])


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
            'posting_option': ('django.db.models.fields.CharField', [], {'default': "'restricted'", 'max_length': '32'}),
            'visibility': ('django.db.models.fields.CharField', [], {'default': "'public'", 'max_length': '32'})
        },
        'event_map.emobject': {
            'Meta': {'object_name': 'emObject'},
            'connections': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'connections_rel_+'", 'blank': 'True', 'to': "orm['event_map.emObject']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'event_map.event': {
            'Meta': {'object_name': 'Event', '_ormbases': ['event_map.emObject']},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_info': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'date_modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'emobject_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.emObject']", 'unique': 'True', 'primary_key': 'True'}),
            'end_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'link': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'location_point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'organization': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'slug': ('autoslug.fields.AutoSlugField', [], {'unique': 'True', 'max_length': '50', 'populate_from': "'title'", 'unique_with': '()'}),
            'start_date': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'venue': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'})
        },
        'event_map.feed': {
            'Meta': {'object_name': 'Feed', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True', 'primary_key': 'True'}),
            'source': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'source_type': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        'event_map.group': {
            'Meta': {'object_name': 'Group', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
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
        }
    }

    complete_apps = ['event_map']