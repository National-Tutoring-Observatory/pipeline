export default async (job) => {
  try {
    switch (job.name) {
      case 'ANNOTATE_PER_SESSION': {
        console.log('Annotating per session');
        break;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}