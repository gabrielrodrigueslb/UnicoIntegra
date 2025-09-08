type loadingProp = {
  loadingMessage: string
}

export default function LoadingScreen({loadingMessage}: loadingProp ) {
  return (
    <>
      <div className="background items-center justify-center bg-[rgba(0,0,0,0.3)] fixed m-auto w-screen h-screen flex">
        <section className=" flex flex-col  bg-white p-7 rounded-2xl ">
            <span className='loading flex flex-col items-center gap-5 justify-center max-w-xs'><img src="/blocks-wave.svg" className="w-25" alt="" />

            <p>{loadingMessage}</p>
            </span>
        </section>
      </div>
    </>
  );
}
