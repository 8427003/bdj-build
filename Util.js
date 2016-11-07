var glob = require('glob');
var path = require('path');

exports.getEntry = function(globPath, pathDir) {
	var files = glob.sync(globPath);
	var entries = {},
		entry, dirname, basename, pathname, extname;

	for (var i = 0; i < files.length; i++) {
		entry = files[i];
		dirname = path.dirname(entry);
		extname = path.extname(entry);
		basename = path.basename(entry, extname);
		pathname = path.normalize(path.join(dirname,  basename));
		pathDir = path.normalize(pathDir);
		if(pathname.startsWith(pathDir)){
			pathname = pathname.substring(pathDir.length)
		}
        if(extname === '.js' || extname === '.jsx'){
            pathname = pathname.replace(/\.entry$/, '');
        }
		entries[pathname] = ['./' + entry];
	}
	return entries;
}

exports.getHash = function (isPublish) {
    return (isPublish ? '-[hash:8]' : '');
}
