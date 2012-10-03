#!/usr/bin/perl

# CONFIGURE

# The location of the TestSwarm that you're going to run against.

my $SWARM = "http://swarm.jquery.org/api.php";

# Your TestSwarm username.
my $USER = "jqueryui";

## replace this
# Your authorization token.
my $AUTH_TOKEN = "";

# The number of commits to search back through
my $NUM = 1;

# The maximum number of times you want the tests to be run.
my $MAX_RUNS = 5;

# The directory in which the checkouts will occur.
my $BASE_DIR = "/srv/swarm.jquery.org/htdocs/git/jquery-ui";

# A script tag loading in the TestSwarm injection script will
# be added at the bottom of the <head> in the following file.

# The name of the job that will be submitted
# (pick a descriptive, but short, name to make it easy to search)

# Note: The string {REV} will be replaced with the current
#       commit number/hash.
my $JOB_NAME = "jQuery UI Commit <a href=\"https://github.com/jquery/jquery-ui/commit/{FREV}\">#{REV}</a>";

# The browsers you wish to run against. Options include:
#  - "all" all available browsers.
#  - "popular" the most popular browser (99%+ of all browsers in use)
#  - "current" the current release of all the major browsers
#  - "gbs" the browsers currently supported in Yahoo's Graded Browser Support
#  - "beta" upcoming alpha/beta of popular browsers
#  - "mobile" the current releases of mobile browsers
#  - "popularbeta" the most popular browser and their upcoming releases
#  - "popularbetamobile" the most popular browser and their upcoming releases and mobile browsers
my $BROWSERS = "popular";

# All the suites that you wish to run within this job
# (can be any number of suites)

## insert static suite list here
my %SUITES = ();

# Comment these out if you wish to define a custom set of SUITES above
## REPLACE local
my $SUITE = "http://swarm.jquery.org/git/jquery-ui/{REV}";

sub BUILD_SUITES {
	%SUITES = map { /(\w+).html$/; $1 => "$SUITE/$_?$1"; } glob("tests/unit/*/*.html");

    print "suites: $SUITES";
    print %SUITES;
}

########### NO NEED TO CONFIGURE BELOW HERE ############

my $DEBUG = 0;

if ( ! -e $BASE_DIR ) {
    die "Problem locating source.";
}

print "chdir $BASE_DIR\n" if ( $DEBUG );
chdir( $BASE_DIR );

print "git log -$NUM --reverse --pretty='format:%H'\n" if ( $DEBUG );
my @revs = split(/\n/, `git log -$NUM --reverse --pretty='format:%H'`);
my %done = map { $_ => 1 } split(/\n/, `cat $BASE_DIR/done.txt`);

foreach my $frev ( @revs ) {
	my $rev = $frev;
	$rev =~ s/^(.{7}).*/$1/;

	if ( !exists $done{ $rev } ) {
		print "New revision: $rev\n" if ( $DEBUG );

		if ( exists &BUILD_SUITES ) {
			&BUILD_SUITES();
		}

		my %props = (
			"action" => "addjob",
			"authUsername" => $USER,
			"authToken" => $AUTH_TOKEN,
			"jobName" => $JOB_NAME,
			"runMax" => $MAX_RUNS,
			"browserSets[]" => $BROWSERS
		);

		my $query = "";

		foreach my $prop ( keys %props ) {
			$query .= ($query ? "&" : "") . $prop . "=" . clean($props{$prop}, $rev, $frev);
		}

		foreach my $suite ( sort keys %SUITES ) {
			$query .= "&runNames[]=" . clean($suite, $rev, $frev) .
		          	"&runUrls[]=" . clean($SUITES{$suite}, $rev, $frev);
		}

		print "curl -d \"$query\" $SWARM\n" if ( $DEBUG );

		my $results = `curl -d "$query" $SWARM`;

		print "Results: $results\n" if ( $DEBUG );

		if ( $results ) {
			$done{ $rev } = 1;

		} else {
			print "Job not submitted properly.\n";
		}

	} else {
		print "Old revision: $rev\n" if ( $DEBUG );
	}
}

print "Saving completed revisions.\n" if ( $DEBUG );

open( DONE, ">$BASE_DIR/done.txt");
foreach my $key ( keys %done ) {
	print DONE "$key\n";
}
close( DONE );

sub clean {
	my $str = shift;
	my $rev = shift;
	my $frev = shift;

	$str =~ s/{REV}/$rev/g;
	$str =~ s/{FREV}/$frev/g;
	$str =~ s/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
	$str;
}
