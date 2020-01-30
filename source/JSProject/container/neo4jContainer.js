const childProcess = require('child_process')
const childProcessOption = { cwd: __dirname, shell: true, stdio: [0, 1, 2] }

// https://neo4j.com/developer/docker-run-neo4j/

// APOC http://neo4j-contrib.github.io/neo4j-apoc-procedures/3.4/installation/
// https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/tag/3.5.0.4
// USAGE for exporting json database, through using Cepher APOC extensions: `CALL apoc.export.json.all("all.json",{useTypes:true})`

//dump initial config file values:

// docker run --rm --volume=$PWD/temporary/neo4j/conf:/conf neo4j:latest dump-config
// -v $PWD/temporary/neo4j/conf:/conf \

// mkdir -p $PWD/temporary/neo4j/data
// mkdir -p $PWD/temporary/neo4j/logs
// mkdir -p $PWD/temporary/neo4j/conf
// mkdir -p $PWD/temporary/neo4j/plugins
// mkdir -p $PWD/temporary/neo4j/import

// -v $PWD/temporary/neo4j/logs:/logs \
// -v $PWD/temporary/neo4j/plugins:/plugins \
// -v $PWD/temporary/neo4j/import:/var/lib/neo4j/import/ \
// -v $PWD/temporary/neo4j/data:/data \
// -e NEO4J_dbms_security_procedures_unrestricted=apoc.\\\* \
// -e NEO4J_apoc_export_file_enabled=true \
// -e NEO4J_apoc_import_file_enabled=true \
// -e NEO4J_apoc_import_file_use__neo4j__config=true \

export function runDockerContainer() {
  console.log(`• Running container: neo4j on port 7686`)
  // TODO: This is a quick automatic starting of dependency container. Provide a better way to handle container dependencies.
  try {
    childProcess.execSync(
      [
        `
        if [ ! "$(docker ps -q -f name=neo4j)" ]; then
          if [ "$(docker ps -aq -f status=exited -f name=neo4j)" ]; then
              # cleanup
              docker rm neo4j
          fi

          docker run \
            --name neo4j \
            -p 7474:7474 -p 7686:7687  \
            -d \
            --env NEO4J_AUTH=neo4j/test \
            neo4j:latest
        fi
        `,
      ].join(' && \\\n'),
      childProcessOption,
    )
  } catch (error) {
    throw error
  }
}
