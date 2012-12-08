# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'AbstractGroup'
        db.create_table('event_map_abstractgroup', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('description', self.gf('django.db.models.fields.TextField')()),
            ('visibility', self.gf('django.db.models.fields.CharField')(default='public', max_length=32)),
            ('posting_option', self.gf('django.db.models.fields.CharField')(default='restricted', max_length=32)),
        ))
        db.send_create_signal('event_map', ['AbstractGroup'])

        # Adding M2M table for field subscription on 'AbstractGroup'
        db.create_table('event_map_abstractgroup_subscription', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_abstractgroup', models.ForeignKey(orm['event_map.abstractgroup'], null=False)),
            ('to_abstractgroup', models.ForeignKey(orm['event_map.abstractgroup'], null=False))
        ))
        db.create_unique('event_map_abstractgroup_subscription', ['from_abstractgroup_id', 'to_abstractgroup_id'])

        # Deleting field 'Feed.group_ptr'
        db.delete_column('event_map_feed', 'group_ptr_id')

        # Adding field 'Feed.abstractgroup_ptr'
        db.add_column('event_map_feed', 'abstractgroup_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(default=1, to=orm['event_map.AbstractGroup'], unique=True, primary_key=True),
                      keep_default=False)

        # Adding field 'Feed.title'
        db.add_column('event_map_feed', 'title',
                      self.gf('django.db.models.fields.CharField')(default=1, unique=True, max_length=255),
                      keep_default=False)

        # Deleting field 'Group.description'
        db.delete_column('event_map_group', 'description')

        # Deleting field 'Group.posting_option'
        db.delete_column('event_map_group', 'posting_option')

        # Deleting field 'Group.id'
        db.delete_column('event_map_group', 'id')

        # Deleting field 'Group.visibility'
        db.delete_column('event_map_group', 'visibility')

        # Adding field 'Group.abstractgroup_ptr'
        db.add_column('event_map_group', 'abstractgroup_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(default=1, to=orm['event_map.AbstractGroup'], unique=True, primary_key=True),
                      keep_default=False)

        # Removing M2M table for field subscription on 'Group'
        db.delete_table('event_map_group_subscription')


        # Changing field 'Permission.group'
        db.alter_column('event_map_permission', 'group_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.AbstractGroup']))
        # Deleting field 'UserGroup.group_ptr'
        db.delete_column('event_map_usergroup', 'group_ptr_id')

        # Adding field 'UserGroup.abstractgroup_ptr'
        db.add_column('event_map_usergroup', 'abstractgroup_ptr',
                      self.gf('django.db.models.fields.related.OneToOneField')(default=1, to=orm['event_map.AbstractGroup'], unique=True, primary_key=True),
                      keep_default=False)

        # Adding field 'UserGroup.title'
        db.add_column('event_map_usergroup', 'title',
                      self.gf('django.db.models.fields.CharField')(default=1, unique=True, max_length=255),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'AbstractGroup'
        db.delete_table('event_map_abstractgroup')

        # Removing M2M table for field subscription on 'AbstractGroup'
        db.delete_table('event_map_abstractgroup_subscription')


        # User chose to not deal with backwards NULL issues for 'Feed.group_ptr'
        raise RuntimeError("Cannot reverse this migration. 'Feed.group_ptr' and its values cannot be restored.")
        # Deleting field 'Feed.abstractgroup_ptr'
        db.delete_column('event_map_feed', 'abstractgroup_ptr_id')

        # Deleting field 'Feed.title'
        db.delete_column('event_map_feed', 'title')


        # User chose to not deal with backwards NULL issues for 'Group.description'
        raise RuntimeError("Cannot reverse this migration. 'Group.description' and its values cannot be restored.")
        # Adding field 'Group.posting_option'
        db.add_column('event_map_group', 'posting_option',
                      self.gf('django.db.models.fields.CharField')(default='restricted', max_length=32),
                      keep_default=False)


        # User chose to not deal with backwards NULL issues for 'Group.id'
        raise RuntimeError("Cannot reverse this migration. 'Group.id' and its values cannot be restored.")
        # Adding field 'Group.visibility'
        db.add_column('event_map_group', 'visibility',
                      self.gf('django.db.models.fields.CharField')(default='public', max_length=32),
                      keep_default=False)

        # Deleting field 'Group.abstractgroup_ptr'
        db.delete_column('event_map_group', 'abstractgroup_ptr_id')

        # Adding M2M table for field subscription on 'Group'
        db.create_table('event_map_group_subscription', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_group', models.ForeignKey(orm['event_map.group'], null=False)),
            ('to_group', models.ForeignKey(orm['event_map.group'], null=False))
        ))
        db.create_unique('event_map_group_subscription', ['from_group_id', 'to_group_id'])


        # Changing field 'Permission.group'
        db.alter_column('event_map_permission', 'group_id', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['event_map.Group']))

        # User chose to not deal with backwards NULL issues for 'UserGroup.group_ptr'
        raise RuntimeError("Cannot reverse this migration. 'UserGroup.group_ptr' and its values cannot be restored.")
        # Deleting field 'UserGroup.abstractgroup_ptr'
        db.delete_column('event_map_usergroup', 'abstractgroup_ptr_id')

        # Deleting field 'UserGroup.title'
        db.delete_column('event_map_usergroup', 'title')


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
            'Meta': {'object_name': 'AbstractGroup'},
            'description': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.User']", 'symmetrical': 'False', 'through': "orm['event_map.Permission']", 'blank': 'True'}),
            'posting_option': ('django.db.models.fields.CharField', [], {'default': "'restricted'", 'max_length': '32'}),
            'subscription': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'subscription_rel_+'", 'blank': 'True', 'to': "orm['event_map.AbstractGroup']"}),
            'visibility': ('django.db.models.fields.CharField', [], {'default': "'public'", 'max_length': '32'})
        },
        'event_map.event': {
            'Meta': {'object_name': 'Event'},
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'contact_info': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'date_created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'date_modified': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'end_date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['event_map.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'link': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'location': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'location_point': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'organization': ('django.db.models.fields.CharField', [], {'max_length': '255', 'null': 'True', 'blank': 'True'}),
            'start_date': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'uuid': ('uuidfield.fields.UUIDField', [], {'unique': 'True', 'max_length': '32', 'blank': 'True'}),
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
            'Meta': {'object_name': 'Permission'},
            'admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'banned': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'group': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['event_map.AbstractGroup']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'write': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'event_map.usergroup': {
            'Meta': {'object_name': 'UserGroup', '_ormbases': ['event_map.AbstractGroup']},
            'abstractgroup_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['event_map.AbstractGroup']", 'unique': 'True', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
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