package listener

import (
	"sync"
	"time"

	"go.uber.org/zap"
)

func (r *PendingLinkRequests) Start(senderAddress string) {
	for {
		// Block until mutex is unlocked after pending link request is processed or
		// after a timeout if there are no pending link requests.
		r.Mutex.Lock()

		linkRequest, err := r.DB.GetNextLinkRequest(senderAddress)
		if err != nil {
			r.Logger.Error("Unable to get next link request, retry after timeout",
				zap.Error(err),
				zap.Int64("Timeout", 5),
			)
			r.waitFor(5)
			continue
		}

		if linkRequest == nil {
			r.Logger.Info("No new link request, retry after timeout",
				zap.Int64("Timeout", 5),
			)
			r.waitFor(5)
			continue
		}

		r.LinkRequests <- *linkRequest
	}
}

func (r *PendingLinkRequests) waitFor(seconds int64) {
	go func(seconds int64, mutex *sync.Mutex) {
		time.Sleep(time.Duration(seconds) * time.Second)
		mutex.Unlock()
	}(seconds, r.Mutex)
}
