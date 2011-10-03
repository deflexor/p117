{-# LANGUAGE OverloadedStrings #-}

module P117.MainPage where

import Control.Exception.Control
import Control.Monad.Error
import Data.String
import Data.Tree
import Database.HDBC
import Database.HDBC.Sqlite3
import Happstack.Server
import P117.MainPage.Tree
import P117.Utils
import Safe
import Text.Blaze
import Text.JSON
import qualified Text.Blaze.Html5 as H
import qualified Text.Blaze.Html5.Attributes as A

pageHandler :: ServerPartT (ErrorT String IO) Response
pageHandler = msum [ dir "page" (methodSP GET getPage)
                   , methodSP GET pageHandlerGet
                   , methodSP POST pageHandlerPost
                   ]

getPage :: ServerPartT (ErrorT String IO) Response
getPage = do
    pageId <- getInputRead "pageId"
    (title, text) <- lift $ bracket (liftIO $ connectSqlite3 "sql/test.db")
                                    (liftIO . disconnect)
                                    $ \conn -> do
        r <- liftIO $ quickQuery' conn "SELECT title,text FROM pages WHERE id == ?" [toSql (pageId :: Integer)]
        let convRow :: [SqlValue] -> (String, String)
            convRow [titleRaw, textRaw] = (fromSql titleRaw, fromSql textRaw)
        when (null r) $ throwError $ "Page with id " ++ show pageId ++ " was not found"
        return $ convRow $ head r

    return $ toResponse $ encode (title, text)

pageHandlerGet :: ServerPartT (ErrorT String IO) Response
pageHandlerGet = do
    predicateTree <- getTreeForPredicate 1

    return $ buildResponse $ do
        "117"
        treeToHtml predicateTree
        H.div ! A.id "pageText" $ ""

pageHandlerPost :: ServerPartT (ErrorT String IO) Response
pageHandlerPost = undefined
