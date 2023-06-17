import fs from "fs"
import { Readable, Transform, pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline)

{

  const readableStream = new Readable({
    read() {

      for (let i = 0; i < 1e8; i++) {
        const data = {
          id: Date.now() + i,
          name: `Lemuel-Pereira(${i})`
        }

        this.push(JSON.stringify(data))
      }

      this.push(null)
    }
  })

  const writableToCsv = new Transform({
    transform(chunk, encoding, cb) {
      const data = JSON.parse(chunk)

      cb(null, `${data.id},${data.name}\n`)
    }
  })

  const setHeader = new Transform({
    transform(chunk, encoding, cb) {
      this.counter = this.counter ?? 0

      if (this.counter) {
        return cb(null, chunk)
      }
      this.counter++

      const header = "id, name\n"
      cb(null, header.concat(chunk))
    }
  })

  await pipelineAsync(
    readableStream,
    writableToCsv,
    setHeader,
    fs.createWriteStream("users.csv")
  )

}

{

  const readableStream = fs.createReadStream("users.csv")

  await pipelineAsync(
    readableStream,
    process.stdout
  )

}