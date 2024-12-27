import autocannon from 'autocannon';

async function runLoadTest() {
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 10
  });
  console.log(result);
}

runLoadTest();
