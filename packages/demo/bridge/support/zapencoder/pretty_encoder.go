package zapencoder

import (
	"encoding/base64"
	"encoding/json"
	"math"
	"strconv"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"
)

var (
	_pool = buffer.NewPool()
	// BufferGet retrieves a buffer from the pool, creating one if necessary.
	BufferGet = _pool.Get
)

var _jsonPool = sync.Pool{New: func() interface{} {
	return &prettyJSONEncoder{}
}}

func getJSONEncoder() *prettyJSONEncoder {
	return _jsonPool.Get().(*prettyJSONEncoder)
}

func putJSONEncoder(enc *prettyJSONEncoder) {
	if enc.reflectBuf != nil {
		enc.reflectBuf.Free()
	}
	enc.EncoderConfig = nil
	enc.buf = nil
	enc.spaced = false
	enc.openNamespaces = 0
	enc.reflectBuf = nil
	enc.reflectEnc = nil
	_jsonPool.Put(enc)
}

type prettyJSONEncoder struct {
	*zapcore.EncoderConfig
	*Formatter
	buf            *buffer.Buffer
	spaced         bool // include spaces after colons and commas
	openNamespaces int
	indent         int

	// for encoding generic values by reflection
	reflectBuf *buffer.Buffer
	reflectEnc *json.Encoder
}

// NewJSONEncoder creates a fast, low-allocation JSON encoder. The encoder
// appropriately escapes all field keys and values.
//
// Note that the encoder doesn't deduplicate keys, so it's possible to produce
// a message like
//   {"foo":"bar","foo":"baz"}
// This is permitted by the JSON specification, but not encouraged. Many
// libraries will ignore duplicate key-value pairs (typically keeping the last
// pair) when unmarshaling, but users should attempt to avoid adding duplicate
// keys.
func NewJSONEncoder(cfg zapcore.EncoderConfig) zapcore.Encoder {
	return newJSONEncoder(cfg, false)
}

func newJSONEncoder(cfg zapcore.EncoderConfig, spaced bool) *prettyJSONEncoder {
	return &prettyJSONEncoder{
		EncoderConfig: &cfg,
		Formatter:     NewFormatter(),
		buf:           BufferGet(),
		spaced:        spaced,
		indent:        1,
	}
}

func (enc *prettyJSONEncoder) AddArray(key string, arr zapcore.ArrayMarshaler) error {
	enc.addKey(key)
	return enc.AppendArray(arr)
}

func (enc *prettyJSONEncoder) AddObject(key string, obj zapcore.ObjectMarshaler) error {
	enc.addKey(key)
	return enc.AppendObject(obj)
}

func (enc *prettyJSONEncoder) AddBinary(key string, val []byte) {
	enc.AddString(key, base64.StdEncoding.EncodeToString(val))
}

func (enc *prettyJSONEncoder) AddByteString(key string, val []byte) {
	enc.addKey(key)
	enc.AppendByteString(val)
}

func (enc *prettyJSONEncoder) AddBool(key string, val bool) {
	enc.addKey(key)
	enc.AppendBool(val)
}

func (enc *prettyJSONEncoder) AddComplex128(key string, val complex128) {
	enc.addKey(key)
	enc.AppendComplex128(val)
}

func (enc *prettyJSONEncoder) AddDuration(key string, val time.Duration) {
	enc.addKey(key)
	enc.AppendDuration(val)
}

func (enc *prettyJSONEncoder) AddFloat64(key string, val float64) {
	enc.addKey(key)
	enc.AppendFloat64(val)
}

func (enc *prettyJSONEncoder) AddInt64(key string, val int64) {
	enc.addKey(key)
	enc.AppendInt64(val)
}

func (enc *prettyJSONEncoder) resetReflectBuf() {
	if enc.reflectBuf == nil {
		enc.reflectBuf = BufferGet()
		enc.reflectEnc = json.NewEncoder(enc.reflectBuf)
	} else {
		enc.reflectBuf.Reset()
	}
}

func (enc *prettyJSONEncoder) AddReflected(key string, obj interface{}) error {
	enc.resetReflectBuf()
	err := enc.reflectEnc.Encode(obj)
	if err != nil {
		return err
	}
	enc.reflectBuf.TrimNewline()
	enc.addKey(key)
	_, err = enc.buf.Write(enc.reflectBuf.Bytes())
	return err
}

func (enc *prettyJSONEncoder) OpenNamespace(key string) {
	enc.addKey(key)
	enc.buf.AppendByte('{')
	enc.openNamespaces++
}

func (enc *prettyJSONEncoder) AddString(key, val string) {
	enc.addKey(key)
	enc.AppendString(val)
}

func (enc *prettyJSONEncoder) AddTime(key string, val time.Time) {
	enc.addKey(key)
	enc.AppendTime(val)
}

func (enc *prettyJSONEncoder) AddUint64(key string, val uint64) {
	enc.addKey(key)
	enc.AppendUint64(val)
}

func (enc *prettyJSONEncoder) AppendArray(arr zapcore.ArrayMarshaler) error {
	enc.addElementSeparator()
	enc.buf.AppendByte('[')
	enc.buf.AppendByte('\n')
	enc.indent++
	err := arr.MarshalLogArray(enc)
	enc.indent--
	enc.buf.AppendByte('\n')
	enc.buf.AppendString(strings.Repeat("\t", enc.indent))
	enc.buf.AppendByte(']')
	return err
}

func (enc *prettyJSONEncoder) AppendObject(obj zapcore.ObjectMarshaler) error {
	enc.addElementSeparator()

	if last := enc.buf.Len() - 1; last >= 0 {
		if enc.buf.Bytes()[last] == '\n' {
			enc.buf.AppendString(strings.Repeat("\t", enc.indent))
		}
	}

	enc.buf.AppendByte('{')
	enc.buf.AppendByte('\n')
	enc.indent++
	err := obj.MarshalLogObject(enc)
	enc.indent--
	enc.buf.AppendByte('\n')
	enc.buf.AppendString(strings.Repeat("\t", enc.indent))
	enc.buf.AppendByte('}')
	return err
}

func (enc *prettyJSONEncoder) AppendBool(val bool) {
	enc.addElementSeparator()
	enc.buf.AppendString(enc.sprintfColor(enc.BoolColor, "%v", val))
}

func (enc *prettyJSONEncoder) AppendByteString(val []byte) {
	enc.addElementSeparator()
	enc.buf.AppendString(enc.sprintfColor(enc.StringColor, "\"%s\"", val))
}

func (enc *prettyJSONEncoder) AppendComplex128(val complex128) {
	enc.addElementSeparator()
	// Cast to a platform-independent, fixed-size type.
	r, i := float64(real(val)), float64(imag(val))
	enc.buf.AppendString(enc.sprintfColor(
		enc.NumberColor,
		"\"%s+%si\"",
		strconv.FormatFloat(r, 'f', -1, 64),
		strconv.FormatFloat(i, 'f', -1, 64),
	))
}

func (enc *prettyJSONEncoder) AppendDuration(val time.Duration) {
	cur := enc.buf.Len()
	enc.EncodeDuration(val, enc)
	if cur == enc.buf.Len() {
		// User-supplied EncodeDuration is a no-op. Fall back to nanoseconds to keep
		// JSON valid.
		enc.AppendInt64(int64(val))
	}
}

func (enc *prettyJSONEncoder) AppendInt64(val int64) {
	enc.addElementSeparator()
	enc.buf.AppendString(enc.sprintfColor(enc.NumberColor, "%d", val))
}

func (enc *prettyJSONEncoder) AppendReflected(val interface{}) error {
	enc.resetReflectBuf()
	err := enc.reflectEnc.Encode(val)
	if err != nil {
		return err
	}
	enc.reflectBuf.TrimNewline()
	enc.addElementSeparator()
	_, err = enc.buf.Write(enc.reflectBuf.Bytes())
	return err
}

func (enc *prettyJSONEncoder) AppendString(val string) {
	enc.addElementSeparator()
	enc.buf.AppendString(enc.sprintfColor(enc.StringColor, "\"%s\"", val))
}

func (enc *prettyJSONEncoder) AppendTime(val time.Time) {
	cur := enc.buf.Len()
	enc.EncodeTime(val, enc)
	if cur == enc.buf.Len() {
		// User-supplied EncodeTime is a no-op. Fall back to nanos since epoch to keep
		// output JSON valid.
		enc.AppendInt64(val.UnixNano())
	}
}

func (enc *prettyJSONEncoder) AppendUint64(val uint64) {
	enc.addElementSeparator()
	enc.buf.AppendString(enc.sprintfColor(enc.NumberColor, "%d", val))
}

func (enc *prettyJSONEncoder) AddComplex64(k string, v complex64) { enc.AddComplex128(k, complex128(v)) }
func (enc *prettyJSONEncoder) AddFloat32(k string, v float32)     { enc.AddFloat64(k, float64(v)) }
func (enc *prettyJSONEncoder) AddInt(k string, v int)             { enc.AddInt64(k, int64(v)) }
func (enc *prettyJSONEncoder) AddInt32(k string, v int32)         { enc.AddInt64(k, int64(v)) }
func (enc *prettyJSONEncoder) AddInt16(k string, v int16)         { enc.AddInt64(k, int64(v)) }
func (enc *prettyJSONEncoder) AddInt8(k string, v int8)           { enc.AddInt64(k, int64(v)) }
func (enc *prettyJSONEncoder) AddUint(k string, v uint)           { enc.AddUint64(k, uint64(v)) }
func (enc *prettyJSONEncoder) AddUint32(k string, v uint32)       { enc.AddUint64(k, uint64(v)) }
func (enc *prettyJSONEncoder) AddUint16(k string, v uint16)       { enc.AddUint64(k, uint64(v)) }
func (enc *prettyJSONEncoder) AddUint8(k string, v uint8)         { enc.AddUint64(k, uint64(v)) }
func (enc *prettyJSONEncoder) AddUintptr(k string, v uintptr)     { enc.AddUint64(k, uint64(v)) }
func (enc *prettyJSONEncoder) AppendComplex64(v complex64)        { enc.AppendComplex128(complex128(v)) }
func (enc *prettyJSONEncoder) AppendFloat64(v float64)            { enc.appendFloat(v, 64) }
func (enc *prettyJSONEncoder) AppendFloat32(v float32)            { enc.appendFloat(float64(v), 32) }
func (enc *prettyJSONEncoder) AppendInt(v int)                    { enc.AppendInt64(int64(v)) }
func (enc *prettyJSONEncoder) AppendInt32(v int32)                { enc.AppendInt64(int64(v)) }
func (enc *prettyJSONEncoder) AppendInt16(v int16)                { enc.AppendInt64(int64(v)) }
func (enc *prettyJSONEncoder) AppendInt8(v int8)                  { enc.AppendInt64(int64(v)) }
func (enc *prettyJSONEncoder) AppendUint(v uint)                  { enc.AppendUint64(uint64(v)) }
func (enc *prettyJSONEncoder) AppendUint32(v uint32)              { enc.AppendUint64(uint64(v)) }
func (enc *prettyJSONEncoder) AppendUint16(v uint16)              { enc.AppendUint64(uint64(v)) }
func (enc *prettyJSONEncoder) AppendUint8(v uint8)                { enc.AppendUint64(uint64(v)) }
func (enc *prettyJSONEncoder) AppendUintptr(v uintptr)            { enc.AppendUint64(uint64(v)) }

func (enc *prettyJSONEncoder) Clone() zapcore.Encoder {
	clone := enc.clone()
	clone.buf.Write(enc.buf.Bytes())
	return clone
}

func (enc *prettyJSONEncoder) clone() *prettyJSONEncoder {
	clone := getJSONEncoder()
	clone.EncoderConfig = enc.EncoderConfig
	clone.Formatter = enc.Formatter
	clone.spaced = enc.spaced
	clone.indent = enc.indent
	clone.openNamespaces = enc.openNamespaces
	clone.buf = BufferGet()
	return clone
}

func (enc *prettyJSONEncoder) EncodeEntry(ent zapcore.Entry, fields []zapcore.Field) (*buffer.Buffer, error) {
	final := enc.clone()
	final.buf.AppendByte('{')

	if final.LevelKey != "" {
		final.addKey(final.LevelKey)
		cur := final.buf.Len()
		final.EncodeLevel(ent.Level, final)
		if cur == final.buf.Len() {
			// User-supplied EncodeLevel was a no-op. Fall back to strings to keep
			// output JSON valid.
			final.AppendString(ent.Level.String())
		}
	}
	if final.TimeKey != "" {
		final.AddTime(final.TimeKey, ent.Time)
	}
	if ent.LoggerName != "" && final.NameKey != "" {
		final.addKey(final.NameKey)
		cur := final.buf.Len()
		nameEncoder := final.EncodeName

		// if no name encoder provided, fall back to FullNameEncoder for backwards
		// compatibility
		if nameEncoder == nil {
			nameEncoder = zapcore.FullNameEncoder
		}

		nameEncoder(ent.LoggerName, final)
		if cur == final.buf.Len() {
			// User-supplied EncodeName was a no-op. Fall back to strings to
			// keep output JSON valid.
			final.AppendString(ent.LoggerName)
		}
	}
	if ent.Caller.Defined && final.CallerKey != "" {
		final.addKey(final.CallerKey)
		cur := final.buf.Len()
		final.EncodeCaller(ent.Caller, final)
		if cur == final.buf.Len() {
			// User-supplied EncodeCaller was a no-op. Fall back to strings to
			// keep output JSON valid.
			final.AppendString(ent.Caller.String())
		}
	}
	if final.MessageKey != "" {
		final.addKey(enc.MessageKey)
		final.AppendString(ent.Message)
	}
	if enc.buf.Len() > 0 {
		final.addElementSeparator()
		final.buf.Write(enc.buf.Bytes())
	}
	for i := range fields {
		fields[i].AddTo(final)
	}
	final.closeOpenNamespaces()
	if ent.Stack != "" && final.StacktraceKey != "" {
		final.AddString(final.StacktraceKey, ent.Stack)
	}
	final.buf.AppendByte('}')
	if final.LineEnding != "" {
		final.buf.AppendString(final.LineEnding)
	} else {
		final.buf.AppendString(zapcore.DefaultLineEnding)
	}

	ret := final.buf
	putJSONEncoder(final)
	return ret, nil
}

func (enc *prettyJSONEncoder) truncate() {
	enc.buf.Reset()
}

func (enc *prettyJSONEncoder) closeOpenNamespaces() {
	for i := 0; i < enc.openNamespaces; i++ {
		enc.buf.AppendByte('}')
	}
}

func (enc *prettyJSONEncoder) addKey(key string) {
	enc.addElementSeparator()
	enc.buf.AppendString(strings.Repeat("\t", enc.indent))
	enc.buf.AppendString(enc.sprintfColor(enc.KeyColor, "\"%s\"", key))
	enc.buf.AppendByte(':')
	if enc.spaced {
		enc.buf.AppendByte(' ')
	}
}

func (enc *prettyJSONEncoder) addElementSeparator() {
	last := enc.buf.Len() - 1
	if last < 0 {
		return
	}
	switch enc.buf.Bytes()[last] {
	case '{', '[', ':', '\n', '\t', ' ':
		return
	default:
		enc.buf.AppendByte('\n')
	}
}

func (enc *prettyJSONEncoder) appendFloat(val float64, bitSize int) {
	enc.addElementSeparator()
	switch {
	case math.IsNaN(val):
		enc.buf.AppendString(enc.sprintColor(enc.NumberColor, `"NaN"`))
	case math.IsInf(val, 1):
		enc.buf.AppendString(enc.sprintColor(enc.NumberColor, `"+Inf"`))
	case math.IsInf(val, -1):
		enc.buf.AppendString(enc.sprintColor(enc.NumberColor, `"-Inf"`))
	default:
		enc.buf.AppendString(enc.sprintColor(enc.NumberColor, strconv.FormatFloat(val, 'f', -1, bitSize)))
	}
}
