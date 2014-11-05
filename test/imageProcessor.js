var ImageProcessor = require('../lib/imageProcessor');
var when = require('when');
var nodefn = require('when/node');
var assert = require('assert');
var fsPath = require('path');
var fs = require('fs-extra');

var images = {
	large: {
			name: 'te-2rb.jpg',
			path: __dirname+'/fixtures/te-2rb.jpg'
	},
	largeTexture: {
			name: 'no_texture.png',
			path: __dirname+'/../browser/images/no_texture.png'
	},
	small: {
			name: 'engilogo.png',
			path: __dirname+'/../browser/images/engilogo.png'
	}
};

describe('ImageProcessor', function()
{
	var imp, upload;

	beforeEach(function()
	{
		imp = new ImageProcessor({
			copy: function(sourcePath, destination)
			{
				var dfd = when.defer();
				// nodefn.call(fs.copy, path, '/tmp/foo/'+name)
				// .then(function() { return path; });
				dfd.resolve('/files'+destination);
				return dfd.promise;
			}
		});
	});

	it('analyzes image correctly', function(done)
	{
		imp.handleUpload(images.small, 'foo')
		.then(function(data) {
			assert.equal(data.original.width, 164);
			assert.equal(data.original.height, 164);
			done();
		})
		.catch(done)
	});

	it('skips thumbnailing if below threshold', function(done)
	{
		imp.handleUpload(images.small, 'foo')
		.then(function(data) {
			assert.equal(data.scaled.url, data.scaledThumbnail.url);
			done();
		})
		.catch(done)
	});

	it('maintains aspect ratio for thumbnail', function(done)
	{
		imp.handleUpload(images.large, 'foo')
		.then(function(data) {
			assert.equal(data.thumbnail.width, 128);
			assert.equal(data.thumbnail.height, 72);
			done();
		})
		.catch(done)
	});

	it('generates the right versions for large', function(done)
	{
		imp.handleUpload(images.large, 'foo')
		.then(function(data) {
			assert.equal(data.original.width, 1920);
			assert.equal(data.thumbnail.width, 128);
			assert.equal(data.scaled.width, 1024);
			assert.equal(data.scaledThumbnail.width, 128);
			done();
		})
		.catch(done)
	});

	it('generates the right versions for large texture', function(done)
	{
		imp.handleUpload(images.largeTexture, 'foo')
		.then(function(data) {
			assert.equal(data.original.width, 256);
			assert.equal(data.thumbnail.width, 128);
			assert.equal(data.scaled.width, 256);
			assert.equal(data.scaledThumbnail.width, 128);
			done();
		})
		.catch(done)
	});

	it('generates the right versions for small', function(done)
	{
		imp.handleUpload(images.small, 'foo')
		.then(function(data) {
			assert.equal(data.original.width, 164);
			assert.equal(data.thumbnail.width, 128);
			assert.equal(data.scaled.width, 128);
			assert.equal(data.scaledThumbnail.width, 128);
			done();
		})
		.catch(done)
	});

	it('puts the files in the right places', function(done)
	{
		imp.handleUpload(images.large, '/kuvat')
		.then(function(data) {
			assert.equal(data.original.path, '/kuvat/te-2rb.jpg');
			assert.equal(data.original.url, '/files/kuvat/te-2rb.jpg');
			assert.equal(data.thumbnail.path, '/kuvat/te-2rb-thumb.jpg');
			assert.equal(data.thumbnail.url, '/files/kuvat/te-2rb-thumb.jpg');
			assert.equal(data.scaled.path, '/kuvat/te-2rb-scaled.jpg');
			assert.equal(data.scaled.url, '/files/kuvat/te-2rb-scaled.jpg');
			assert.equal(data.scaledThumbnail.path, '/kuvat/te-2rb-scaled-thumb.jpg');
			assert.equal(data.scaledThumbnail.url, '/files/kuvat/te-2rb-scaled-thumb.jpg');
			done();
		})
		.catch(done)
	});
});
