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

exports.getHash = function (isPublish, hashStr) {
    hashStr = hashStr || 'chunkhash';
    return (isPublish ? '-['+hashStr+':8]' : '');
}

// https://webpack.js.org/configuration/stats/#stats
//
exports.stats = {
    // Add asset Information
    assets: false,

    // Add information about cached (not built) modules
    cached: false,
    // Add children information
    children: false,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,
    // Add built modules information to chunk information
    chunkModules: false,
    // Add the origins of chunks and chunk merging info
    chunkOrigins: false,
    // Add errors
    errors: false,
    // Add details to errors (like resolving log)
    errorDetails:  false,
    // Add the hash of the compilation
    hash: false,
    // Add built modules information
    modules: false,
    // Add public path information
    publicPath: false,
    // Add information about the reasons why modules are included
    reasons: false,
    // Add the source code of modules
    source: false,
    // Add timing information
    timings: false,
    // Add webpack version information
    version: false,
    // Add warnings
    warnings: false,
    // Add color in terminal
    colors: true
}
