package db

import (
	"time"

	"go.uber.org/zap"
)

/*
dbr events triggers found after digging through dbr source code
- dbr.go/exec
	- EventErrKv("dbr.exec.interpolate", err, kvs{
			"sql":  query,
			"args": fmt.Sprint(value),
		})
	- EventErrKv("dbr.exec.exec", err, kvs{
			"sql": query,
		})
	- TimingKv("dbr.exec", time.Since(startTime).Nanoseconds(), kvs{
			"sql": query,
		})
- dbr.go/query
	- EventErrKv("dbr.select.interpolate", err, kvs{
			"sql":  query,
			"args": fmt.Sprint(value),
		})
	- EventErrKv("dbr.select.load.query", err, kvs{
			"sql": query,
		})
	- EventErrKv("dbr.select.load.scan", err, kvs{
			"sql": query,
		})
	- TimingKv("dbr.select", time.Since(startTime).Nanoseconds(), kvs{
			"sql": query,
		})
- transaction.go/BeginTx
	- EventErr("dbr.begin.error", err)
	- Event("dbr.begin")
- transaction.go/Commit
	- EventErr("dbr.commit.error", err)
	- Event("dbr.commit")
- transaction.go/Rollback
	- EventErr("dbr.rollback", err)
	- Event("dbr.rollback")
- transaction.go/RollbackUnlessCommitted
	- EventErr("dbr.rollback_unless_committed", err)
	- Event("dbr.rollback")
*/

// DbrTracer implements dbr.EventReceiver to trace dbr events.
type DbrTracer struct {
	Logger *zap.Logger
}

// Event receives a simple notification when various events occur
func (d *DbrTracer) Event(eventName string) {
}

// EventKv receives a notification when various events occur along with
// optional key/value data
func (d *DbrTracer) EventKv(eventName string, kvs map[string]string) {
	// Currently not in use by dbr
}

// EventErr receives a notification of an error if one occurs
func (d *DbrTracer) EventErr(eventName string, err error) error {
	return err
}

// EventErrKv receives a notification of an error if one occurs along with
// optional key/value data
func (d *DbrTracer) EventErrKv(eventName string, err error, kvs map[string]string) error {
	values := []zap.Field{
		zap.String("event", eventName),
		zap.Error(err),
	}
	for k, v := range kvs {
		values = append(values, zap.String(k, v))
	}
	d.Logger.Debug("dbr error", values...)
	return err
}

// Timing receives the time an event took to happen
func (d *DbrTracer) Timing(eventName string, nanoseconds int64) {
	// Currently not in use by dbr
}

// TimingKv receives the time an event took to happen along with optional
// key/value data
func (d *DbrTracer) TimingKv(eventName string, nanoseconds int64, kvs map[string]string) {
	if query, ok := kvs["sql"]; ok {
		d.Logger.Debug("dbr query",
			zap.String("event", eventName),
			zap.String("query", query),
			zap.Float64("time taken", float64(nanoseconds)/float64(time.Second)),
		)
	}
}

func (d *DbrTracer) setTags(kvs map[string]string) {
	if query, ok := kvs["sql"]; ok {
		d.Logger.Debug("dbr query", zap.String("query", query))
	}
}
