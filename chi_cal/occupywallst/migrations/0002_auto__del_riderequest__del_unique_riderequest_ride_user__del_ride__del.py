# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing unique constraint on 'Article', fields ['slug']
        db.delete_unique('occupywallst_article', ['slug'])

        # Removing unique constraint on 'Ride', fields ['user', 'title']
        db.delete_unique('occupywallst_ride', ['user_id', 'title'])

        # Removing unique constraint on 'RideRequest', fields ['ride', 'user']
        db.delete_unique('occupywallst_riderequest', ['ride_id', 'user_id'])

        # Deleting model 'RideRequest'
        db.delete_table('occupywallst_riderequest')

        # Deleting model 'Ride'
        db.delete_table('occupywallst_ride')


    def backwards(self, orm):
        # Adding model 'RideRequest'
        db.create_table('occupywallst_riderequest', (
            ('info', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('status', self.gf('django.db.models.fields.CharField')(default='pending', max_length=32)),
            ('is_deleted', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('ride', self.gf('django.db.models.fields.related.ForeignKey')(related_name='requests', to=orm['occupywallst.Ride'])),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal('occupywallst', ['RideRequest'])

        # Adding unique constraint on 'RideRequest', fields ['ride', 'user']
        db.create_unique('occupywallst_riderequest', ['ride_id', 'user_id'])

        # Adding model 'Ride'
        db.create_table('occupywallst_ride', (
            ('seats_total', self.gf('django.db.models.fields.IntegerField')(default=0)),
            ('ridetype', self.gf('django.db.models.fields.CharField')(max_length=32)),
            ('waypoints', self.gf('django.db.models.fields.TextField')()),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('depart_time', self.gf('django.db.models.fields.DateTimeField')()),
            ('info', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('is_deleted', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=255)),
            ('route', self.gf('django.contrib.gis.db.models.fields.LineStringField')(default=None, null=True)),
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('published', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('route_data', self.gf('django.db.models.fields.TextField')(blank=True)),
        ))
        db.send_create_signal('occupywallst', ['Ride'])

        # Adding unique constraint on 'Ride', fields ['user', 'title']
        db.create_unique('occupywallst_ride', ['user_id', 'title'])

        # Adding unique constraint on 'Article', fields ['slug']
        db.create_unique('occupywallst_article', ['slug'])


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
        'occupywallst.article': {
            'Meta': {'object_name': 'Article'},
            'allow_html': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'author': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'}),
            'comment_count': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'is_deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_event': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_forum': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_visible': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'killed': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'published': ('django.db.models.fields.DateTimeField', [], {}),
            'slug': ('django.db.models.fields.SlugField', [], {'max_length': '50'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'occupywallst.articletranslation': {
            'Meta': {'unique_together': "(('article', 'language'),)", 'object_name': 'ArticleTranslation'},
            'article': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['occupywallst.Article']"}),
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '255'})
        },
        'occupywallst.comment': {
            'Meta': {'object_name': 'Comment'},
            'article': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['occupywallst.Article']"}),
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'downs': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip': ('django.db.models.fields.CharField', [], {'max_length': '255', 'blank': 'True'}),
            'is_deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_removed': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'karma': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'parent_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'published': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'ups': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']", 'null': 'True', 'blank': 'True'})
        },
        'occupywallst.commentvote': {
            'Meta': {'unique_together': "(('comment', 'user'),)", 'object_name': 'CommentVote'},
            'comment': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['occupywallst.Comment']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'vote': ('django.db.models.fields.IntegerField', [], {})
        },
        'occupywallst.list': {
            'Meta': {'object_name': 'List'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        'occupywallst.listconfirm': {
            'Meta': {'object_name': 'ListConfirm'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'mlist': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['occupywallst.List']"}),
            'token': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'})
        },
        'occupywallst.listmember': {
            'Meta': {'unique_together': "(('mlist', 'email'),)", 'object_name': 'ListMember'},
            'created': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'ip': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'mlist': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'members'", 'to': "orm['occupywallst.List']"})
        },
        'occupywallst.message': {
            'Meta': {'object_name': 'Message'},
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'from_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'messages_sent'", 'to': "orm['auth.User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_deleted': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'published': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'to_user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'messages_recv'", 'to': "orm['auth.User']"})
        },
        'occupywallst.notification': {
            'Meta': {'object_name': 'Notification'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_read': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'message': ('django.db.models.fields.TextField', [], {}),
            'published': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.TextField', [], {}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'occupywallst.spamtext': {
            'Meta': {'object_name': 'SpamText'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_regex': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'text': ('django.db.models.fields.TextField', [], {})
        },
        'occupywallst.userinfo': {
            'Meta': {'object_name': 'UserInfo'},
            'address': ('django.db.models.fields.CharField', [], {'max_length': '256', 'blank': 'True'}),
            'attendance': ('django.db.models.fields.CharField', [], {'default': "'maybe'", 'max_length': '32'}),
            'city': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '2', 'blank': 'True'}),
            'formatted_address': ('django.db.models.fields.CharField', [], {'max_length': '256', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'info': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'is_moderator': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_shadow_banned': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'karma': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'need_ride': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'notify_message': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'notify_news': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'position': ('django.contrib.gis.db.models.fields.PointField', [], {'null': 'True', 'blank': 'True'}),
            'region': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['auth.User']", 'unique': 'True'}),
            'zipcode': ('django.db.models.fields.CharField', [], {'max_length': '16', 'blank': 'True'})
        },
        'occupywallst.verbiage': {
            'Meta': {'object_name': 'Verbiage'},
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '255'}),
            'use_markdown': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'use_template': ('django.db.models.fields.BooleanField', [], {'default': 'False'})
        },
        'occupywallst.verbiagetranslation': {
            'Meta': {'unique_together': "(('verbiage', 'language'),)", 'object_name': 'VerbiageTranslation'},
            'content': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '255'}),
            'verbiage': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'translations'", 'to': "orm['occupywallst.Verbiage']"})
        }
    }

    complete_apps = ['occupywallst']